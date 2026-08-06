import {
  getClientIp,
  getSupabaseAdmin,
  LISTING_PHOTOS_BUCKET,
  LISTINGS_TABLE,
  readMultipartFormData,
  sendJson,
} from './_supabaseAdmin.js';

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MIN_IMAGES = 4;
const MAX_IMAGES = 10;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const FILE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return false;

  current.count += 1;
  return true;
}

function requiredText(formData, key) {
  return String(formData.get(key) || '').trim();
}

function validateListingPayload(formData) {
  const listing = {
    full_name: requiredText(formData, 'fullName'),
    title: requiredText(formData, 'title'),
    city: requiredText(formData, 'city'),
    address: requiredText(formData, 'district'),
    monthly_rent: requiredText(formData, 'rent'),
    deposit: requiredText(formData, 'deposit'),
    room_type: requiredText(formData, 'roomType'),
    house_type: requiredText(formData, 'homeType'),
    target_group: requiredText(formData, 'targetAudience'),
    gender_preference: requiredText(formData, 'genderPreference'),
    people_count: requiredText(formData, 'peopleCount'),
    description: requiredText(formData, 'description'),
    contact_info: requiredText(formData, 'contact'),
    phone_number: requiredText(formData, 'phoneNumber'),
    image_urls: [],
    status: 'pending',
  };

  const missingField = Object.entries(listing).find(([key, value]) => {
    return key !== 'image_urls' && key !== 'status' && !value;
  });

  if (missingField) {
    throw new Error('Tüm zorunlu ilan alanları doldurulmalıdır.');
  }

  return listing;
}

function getImageFiles(formData) {
  return formData.getAll('images').filter((file) => {
    return file && typeof file === 'object' && typeof file.arrayBuffer === 'function';
  });
}

function validateImageFiles(files) {
  if (files.length < MIN_IMAGES) {
    throw new Error('En az 4 fotoğraf yüklemelisiniz.');
  }

  if (files.length > MAX_IMAGES) {
    throw new Error('En fazla 10 fotoğraf yükleyebilirsiniz.');
  }

  files.forEach((file) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error('Sadece JPG, PNG veya WebP formatında fotoğraf yükleyebilirsiniz.');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Her fotoğraf en fazla 8 MB olabilir.');
    }
  });
}

async function verifyCaptcha(token, ip) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('CAPTCHA doğrulaması yapılandırılmamış.');
  }

  if (!token) {
    throw new Error('CAPTCHA doğrulaması zorunludur.');
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
      remoteip: ip,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error('CAPTCHA doğrulaması başarısız oldu.');
  }
}

async function uploadImages(supabase, files) {
  const folderId = crypto.randomUUID();
  const uploaded = [];

  for (const [index, file] of files.entries()) {
    const extension = FILE_EXTENSIONS[file.type];
    const filePath = `${folderId}/${crypto.randomUUID()}-${index + 1}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).upload(filePath, fileBuffer, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);
    }

    const { data } = supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(filePath);
    uploaded.push({ path: filePath, url: data.publicUrl });
  }

  return uploaded;
}

async function cleanupUploadedImages(supabase, uploadedImages) {
  const paths = uploadedImages.map((image) => image.path).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(paths);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    sendJson(res, 429, { error: 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.' });
    return;
  }

  let uploadedImages = [];

  try {
    const supabase = getSupabaseAdmin();
    const formData = await readMultipartFormData(req);
    await verifyCaptcha(requiredText(formData, 'captchaToken'), ip);

    const listing = validateListingPayload(formData);
    const imageFiles = getImageFiles(formData);
    validateImageFiles(imageFiles);

    uploadedImages = await uploadImages(supabase, imageFiles);
    listing.image_urls = uploadedImages.map((image) => image.url);

    const { data, error } = await supabase.from(LISTINGS_TABLE).insert(listing).select('*').single();

    if (error) {
      await cleanupUploadedImages(supabase, uploadedImages);
      throw new Error(`İlan kaydedilemedi: ${error.message}`);
    }

    sendJson(res, 201, { listing: data });
  } catch (error) {
    if (uploadedImages.length > 0) {
      try {
        await cleanupUploadedImages(getSupabaseAdmin(), uploadedImages);
      } catch {
        // Best-effort cleanup only.
      }
    }

    sendJson(res, 400, { error: error.message || 'İlan gönderilemedi.' });
  }
}
