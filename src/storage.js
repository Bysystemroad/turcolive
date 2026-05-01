const STORAGE_KEY = 'turcolive_listings';

const textFields = [
  'id',
  'createdAt',
  'title',
  'city',
  'district',
  'rent',
  'deposit',
  'roomType',
  'homeType',
  'targetAudience',
  'peopleCount',
  'description',
  'contact',
  'imageFileNames',
];

export function stripMediaFromListing(listing) {
  return textFields.reduce((safeListing, field) => {
    if (listing[field] !== undefined && listing[field] !== null) {
      safeListing[field] = listing[field];
    }
    return safeListing;
  }, {});
}

export function loadListings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const listings = raw ? JSON.parse(raw) : [];
    return Array.isArray(listings) ? listings.map(stripMediaFromListing) : [];
  } catch {
    return [];
  }
}

export function saveListings(listings) {
  try {
    const safeListings = listings.map(stripMediaFromListing);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeListings));
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        'İlan tarayıcı hafızasına kaydedilemedi. Fotoğraflar yalnızca bu oturumda önizleme olarak gösterilir.',
      error,
    };
  }
}
