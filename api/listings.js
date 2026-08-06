import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';
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
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_WINDOW_SECONDS = 24 * 60 * 60;
const RATE_LIMIT_MAX = 2;
const RATE_LIMIT_MESSAGE = 'Günlük ilan gönderme sınırına ulaştınız. Yeni bir ilan göndermek için lütfen 24 saat bekleyin.';
const RATE_LIMIT_CLAIM_SCRIPT = `
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
if current >= tonumber(ARGV[1]) then
  local ttl = redis.call("PTTL", KEYS[1])
  return {0, current, ttl}
end
current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[2])
end
local ttl = redis.call("PTTL", KEYS[1])
return {1, current, ttl}
`;

// Emergency fallback only. Vercel serverless instances do not share this Map,
// so Redis is the production limiter and this only softens failures if Redis is unavailable.
const fallbackRateLimitStore = new Map();
let redisClient;
let rateLimitClaimScript;

function getRedisClient() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redisClient) {
    redisClient = Redis.fromEnv();
  }

  return redisClient;
}

function getRateLimitClaimScript() {
  const redis = getRedisClient();
  if (!redis) return null;

  if (!rateLimitClaimScript) {
    rateLimitClaimScript = redis.createScript(RATE_LIMIT_CLAIM_SCRIPT);
  }

  return rateLimitClaimScript;
}

function hashIp(ip) {
  return createHash('sha256').update(String(ip || 'unknown')).digest('hex').slice(0, 32);
}

function getRateLimitKey(ip) {
  return `turcolive:listing-submit:${hashIp(ip)}`;
}

function retryAfterFromMs(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return RATE_LIMIT_WINDOW_SECONDS;
  return Math.max(1, Math.ceil(milliseconds / 1000));
}

function setRetryAfter(res, retryAfterSeconds) {
  res.setHeader('Retry-After', String(retryAfterSeconds || RATE_LIMIT_WINDOW_SECONDS));
}

function getFallbackRecord(ip) {
  const now = Date.now();
  const key = getRateLimitKey(ip);
  const current = fallbackRateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    fallbackRateLimitStore.set(key, next);
    return next;
  }

  return current;
}

function getFallbackStatus(ip) {
  const record = getFallbackRecord(ip);
  return {
    limited: record.count >= RATE_LIMIT_MAX,
    retryAfterSeconds: retryAfterFromMs(record.resetAt - Date.now()),
    source: 'memory-fallback',
  };
}

function claimFallbackSuccessfulSubmission(ip) {
  const record = getFallbackRecord(ip);

  if (record.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: retryAfterFromMs(record.resetAt - Date.now()),
      source: 'memory-fallback',
    };
  }

  record.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: retryAfterFromMs(record.resetAt - Date.now()),
    source: 'memory-fallback',
  };
}

async function getPersistentStatus(ip) {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const key = getRateLimitKey(ip);
    const [count, ttlMs] = await Promise.all([redis.get(key), redis.pttl(key)]);
    const numericCount = Number(count || 0);

    return {
      limited: numericCount >= RATE_LIMIT_MAX,
      retryAfterSeconds: retryAfterFromMs(Number(ttlMs)),
      source: 'redis',
    };
  } catch {
    return null;
  }
}

async function getRateLimitStatus(ip) {
  return (await getPersistentStatus(ip)) || getFallbackStatus(ip);
}

async function claimPersistentSuccessfulSubmission(ip) {
  const script = getRateLimitClaimScript();
  if (!script) return null;

  try {
    const key = getRateLimitKey(ip);
    const result = await script.eval([key], [String(RATE_LIMIT_MAX), String(RATE_LIMIT_WINDOW_MS)]);
    const [allowed, , ttlMs] = Array.isArray(result) ? result.map(Number) : [0, 0, RATE_LIMIT_WINDOW_MS];

    return {
      allowed: allowed === 1,
      retryAfterSeconds: retryAfterFromMs(ttlMs),
      source: 'redis',
    };
  } catch {
    return null;
  }
}

async function claimSuccessfulSubmission(ip) {
  return (await claimPersistentSuccessfulSubmission(ip)) || claimFallbackSuccessfulSubmission(ip);
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

async function cleanupInsertedListing(supabase, listingId) {
  if (listingId) {
    await supabase.from(LISTINGS_TABLE).delete().eq('id', listingId);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const ip = getClientIp(req);
  const rateLimitStatus = await getRateLimitStatus(ip);

  if (rateLimitStatus.limited) {
    setRetryAfter(res, rateLimitStatus.retryAfterSeconds);
    sendJson(res, 429, { error: RATE_LIMIT_MESSAGE });
    return;
  }

  let uploadedImages = [];
  let insertedListingId = '';

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

    insertedListingId = data.id;
    const claim = await claimSuccessfulSubmission(ip);

    if (!claim.allowed) {
      await cleanupInsertedListing(supabase, insertedListingId);
      await cleanupUploadedImages(supabase, uploadedImages);
      setRetryAfter(res, claim.retryAfterSeconds);
      sendJson(res, 429, { error: RATE_LIMIT_MESSAGE });
      return;
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
