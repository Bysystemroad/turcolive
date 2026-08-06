import {
  getStoragePathFromPublicUrl,
  getSupabaseAdmin,
  LISTING_PHOTOS_BUCKET,
  LISTINGS_TABLE,
  readJson,
  requireAuthenticatedUser,
  sendJson,
} from './_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const user = await requireAuthenticatedUser(req);
    const { listingId } = await readJson(req);

    if (!listingId) {
      throw new Error('İlan ID zorunludur.');
    }

    const supabase = getSupabaseAdmin();
    const { data: listing, error: fetchError } = await supabase
      .from(LISTINGS_TABLE)
      .select('id,user_id,image_urls')
      .eq('id', listingId)
      .single();

    if (fetchError || !listing) {
      throw new Error('İlan bulunamadı.');
    }

    if (listing.user_id !== user.id) {
      sendJson(res, 403, { error: 'Bu ilanı silme yetkiniz yok.' });
      return;
    }

    const storagePaths = (listing.image_urls || []).map(getStoragePathFromPublicUrl).filter(Boolean);
    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(storagePaths);
      if (storageError) {
        throw new Error(`Fotoğraflar silinemedi: ${storageError.message}`);
      }
    }

    const { error: deleteError } = await supabase.from(LISTINGS_TABLE).delete().eq('id', listingId).eq('user_id', user.id);
    if (deleteError) {
      throw new Error(`İlan silinemedi: ${deleteError.message}`);
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || 'İlan silinemedi.' });
  }
}
