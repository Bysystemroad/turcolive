import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

const LISTINGS_TABLE = 'listings';
const LISTING_PHOTOS_BUCKET = 'listing-photos';
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
    image_urls: listing.imageUrls || [],
    status: 'pending',
  };
}

function fromDbListing(listing) {
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
    imageUrls: listing.image_urls || [],
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

export async function uploadListingPhotos(listingId, imageFiles = []) {
  assertSupabaseConfigured();

  const uploadedImages = [];

  for (const [index, file] of imageFiles.entries()) {
    const fileName = `${Date.now()}-${index + 1}-${sanitizeFileName(file.name)}`;
    const filePath = `${listingId}/${fileName}`;

    const { error } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);
    }

    const { data } = supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(filePath);
    uploadedImages.push({
      fileName: file.name,
      url: data.publicUrl,
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
