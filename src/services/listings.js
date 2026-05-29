import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

const LISTINGS_TABLE = 'listings';
const LISTING_PHOTOS_BUCKET = 'listing-photos';
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const CITY_ALIASES = {
  Floransa: 'Firenze',
  Venedik: 'Venezia',
};

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase bağlantısı yapılandırılmamış.');
  }
}

function normalizeCity(city) {
  return CITY_ALIASES[city] || city;
}

function normalizeStoragePath(value) {
  return String(value || '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/^listing-photos\/+/, '');
}

function isUsablePublicUrl(value) {
  const url = String(value || '').trim();
  return /^https?:\/\//i.test(url) && !url.startsWith('blob:') && url.includes('/storage/v1/object/public/');
}

function getPublicImageUrl(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue || rawValue.startsWith('blob:')) return '';

  if (isUsablePublicUrl(rawValue)) return rawValue;

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  const filePath = normalizeStoragePath(rawValue);
  if (!filePath || !supabase) return '';

  const { data } = supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(filePath);
  return data?.publicUrl || '';
}

function normalizeImageUrls(imageUrls = []) {
  const values = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

  return values
    .map(getPublicImageUrl)
    .filter((url) => /^https?:\/\//i.test(url) && !url.startsWith('blob:'));
}

function toDbListing(listing) {
  return {
    full_name: listing.fullName,
    title: listing.title,
    city: listing.city,
    address: listing.district,
    monthly_rent: listing.rent,
    deposit: listing.deposit,
    room_type: listing.roomType,
    house_type: listing.homeType,
    target_group: listing.targetAudience,
    gender_preference: listing.genderPreference,
    people_count: listing.peopleCount,
    description: listing.description,
    contact_info: listing.contact,
    phone_number: listing.phoneNumber,
    image_urls: normalizeImageUrls(listing.imageUrls || []),
    status: 'pending',
  };
}

function fromDbListing(listing) {
  const imageUrls = normalizeImageUrls(listing.image_urls || []);

  return {
    id: listing.id,
    createdAt: listing.created_at,
    fullName: listing.full_name,
    title: listing.title,
    city: normalizeCity(listing.city),
    district: listing.address ?? listing.district ?? '',
    rent: listing.monthly_rent ?? listing.rent ?? '',
    deposit: listing.deposit,
    roomType: listing.room_type,
    homeType: listing.house_type ?? listing.home_type ?? '',
    targetAudience: listing.target_group ?? listing.target_audience ?? '',
    genderPreference: listing.gender_preference,
    peopleCount: listing.people_count,
    description: listing.description,
    contact: listing.contact_info ?? listing.contact ?? '',
    phoneNumber: listing.phone_number,
    status: listing.status || 'pending',
    imageFileNames: listing.image_file_names || [],
    imageUrls,
    image_urls: imageUrls,
  };
}

function sanitizeFileName(fileName) {
  return String(fileName || 'image')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function getFileExtension(fileName) {
  return String(fileName || '').split('.').pop()?.toLowerCase() || '';
}

function validateImageFile(file) {
  const extension = getFileExtension(file.name);

  if (!ALLOWED_IMAGE_TYPES.includes(file.type) || !ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    throw new Error('Sadece JPG, PNG veya WebP formatında fotoğraf yükleyebilirsiniz.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Her fotoğraf en fazla 8 MB olabilir.');
  }
}

export async function uploadListingPhotos(listingId, imageFiles = []) {
  assertSupabaseConfigured();

  const uploadedImages = [];

  for (const [index, file] of imageFiles.entries()) {
    validateImageFile(file);

    const fileName = `${Date.now()}-${index + 1}-${sanitizeFileName(file.name)}`;
    const filePath = `${listingId}/${fileName}`;

    const { error } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);
    }

    const { data } = supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(filePath);
    const publicUrl = data?.publicUrl || '';

    if (!isUsablePublicUrl(publicUrl)) {
      throw new Error('Fotoğraf için Supabase public URL üretilemedi.');
    }

    uploadedImages.push({
      fileName: file.name,
      url: publicUrl,
      path: filePath,
    });
  }

  return uploadedImages;
}

export async function fetchListings({ includePending = false } = {}) {
  assertSupabaseConfigured();

  let query = supabase.from(LISTINGS_TABLE).select('*').order('created_at', { ascending: false });

  if (!includePending) {
    query = query.eq('status', 'approved');
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`İlanlar yüklenemedi: ${error.message}`);
  }

  return (data || []).map(fromDbListing);
}

export async function createListing(listing) {
  assertSupabaseConfigured();

  const uploadFolderId = listing.id || crypto.randomUUID();
  const uploadedImages = await uploadListingPhotos(uploadFolderId, listing.imageFiles || []);
  const imageUrls = uploadedImages.map((image) => image.url);

  const dbListing = toDbListing({
    ...listing,
    imageUrls,
  });

  const { data, error } = await supabase.from(LISTINGS_TABLE).insert(dbListing).select('*').single();

  if (error) {
    throw new Error(`İlan kaydedilemedi: ${error.message}`);
  }

  return fromDbListing(data);
}

export async function updateListingStatus(listingId, status) {
  assertSupabaseConfigured();

  const allowedStatuses = ['pending', 'approved', 'rejected', 'spam'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Geçersiz ilan durumu.');
  }

  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .update({ status })
    .eq('id', listingId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`İlan durumu güncellenemedi: ${error.message}`);
  }

  return fromDbListing(data);
}

export async function deleteListing(listingId) {
  assertSupabaseConfigured();

  const { error } = await supabase.from(LISTINGS_TABLE).delete().eq('id', listingId);

  if (error) {
    throw new Error(`İlan silinemedi: ${error.message}`);
  }
}
