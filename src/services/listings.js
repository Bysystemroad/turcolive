import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

const LISTINGS_TABLE = 'listings';
const LISTING_PHOTOS_BUCKET = 'listing-photos';
const CITY_ALIASES = {
  Floransa: 'Firenze',
  Venedik: 'Venezia',
};

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase baglantisi yapilandirilmamis.');
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

export async function fetchListings({ includePending = false } = {}) {
  assertSupabaseConfigured();

  let query = supabase.from(LISTINGS_TABLE).select('*').order('created_at', { ascending: false });

  if (!includePending) {
    query = query.eq('status', 'approved');
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Ilanlar yuklenemedi: ${error.message}`);
  }

  return (data || []).map(fromDbListing);
}

export async function createListing(listing) {
  const formData = new FormData();

  [
    'fullName',
    'title',
    'city',
    'district',
    'rent',
    'deposit',
    'roomType',
    'homeType',
    'targetAudience',
    'genderPreference',
    'peopleCount',
    'description',
    'contact',
    'phoneNumber',
    'captchaToken',
  ].forEach((field) => {
    formData.append(field, listing[field] || '');
  });

  (listing.imageFiles || []).forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetch('/api/listings', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Ilan gonderilemedi.');
  }

  return fromDbListing(payload.listing);
}

export async function updateListingStatus(listingId, status) {
  assertSupabaseConfigured();

  const allowedStatuses = ['pending', 'approved', 'rejected', 'spam'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('Gecersiz ilan durumu.');
  }

  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .update({ status })
    .eq('id', listingId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Ilan durumu guncellenemedi: ${error.message}`);
  }

  return fromDbListing(data);
}

export async function deleteListing(listingId) {
  assertSupabaseConfigured();

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) {
    throw new Error('Admin oturumu bulunamadi.');
  }

  const response = await fetch('/api/admin-delete-listing', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ listingId }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Ilan silinemedi.');
  }
}
