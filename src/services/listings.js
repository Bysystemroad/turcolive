import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

const LISTINGS_TABLE = 'listings';
const LISTING_PHOTOS_BUCKET = 'listing-photos';

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase bağlantısı yapılandırılmamış.');
  }
}

function toDbListing(listing) {
  return {
    id: listing.id,
    created_at: listing.createdAt,
    full_name: listing.fullName,
    title: listing.title,
    city: listing.city,
    district: listing.district,
    rent: listing.rent,
    deposit: listing.deposit,
    room_type: listing.roomType,
    home_type: listing.homeType,
    target_audience: listing.targetAudience,
    gender_preference: listing.genderPreference,
    people_count: listing.peopleCount,
    description: listing.description,
    contact: listing.contact,
    phone_number: listing.phoneNumber,
    status: listing.status || 'pending',
    image_file_names: listing.imageFileNames || [],
    image_urls: listing.imageUrls || [],
  };
}

function fromDbListing(listing) {
  return {
    id: listing.id,
    createdAt: listing.created_at,
    fullName: listing.full_name,
    title: listing.title,
    city: listing.city,
    district: listing.district,
    rent: listing.rent,
    deposit: listing.deposit,
    roomType: listing.room_type,
    homeType: listing.home_type,
    targetAudience: listing.target_audience,
    genderPreference: listing.gender_preference,
    peopleCount: listing.people_count,
    description: listing.description,
    contact: listing.contact,
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

  const id = listing.id || crypto.randomUUID();
  const createdAt = listing.createdAt || new Date().toISOString();
  const uploadedImages = await uploadListingPhotos(id, listing.imageFiles || []);
  const imageFileNames = uploadedImages.map((image) => image.fileName);
  const imageUrls = uploadedImages.map((image) => image.url);

  const dbListing = toDbListing({
    ...listing,
    id,
    createdAt,
    status: 'pending',
    imageFileNames,
    imageUrls,
  });

  const { data, error } = await supabase.from(LISTINGS_TABLE).insert(dbListing).select('*').single();

  if (error) {
    throw new Error(`İlan kaydedilemedi: ${error.message}`);
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
