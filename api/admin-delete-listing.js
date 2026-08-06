import {
  getStoragePathFromPublicUrl,
  getSupabaseAdmin,
  LISTING_PHOTOS_BUCKET,
  LISTINGS_TABLE,
  requireAdminUser,
  sendJson,
} from './_supabaseAdmin.js';

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return {};

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    await requireAdminUser(req);

    const { listingId } = await readJson(req);
    if (!listingId) {
      throw new Error('İlan ID zorunludur.');
    }

    const supabase = getSupabaseAdmin();
    const { data: listing, error: fetchError } = await supabase
      .from(LISTINGS_TABLE)
      .select('id,image_urls')
      .eq('id', listingId)
      .single();

    if (fetchError) {
      throw new Error(`İlan bulunamadı: ${fetchError.message}`);
    }

    const storagePaths = (listing.image_urls || []).map(getStoragePathFromPublicUrl).filter(Boolean);

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(storagePaths);
      if (storageError) {
        throw new Error(`Fotoğraflar silinemedi: ${storageError.message}`);
      }
    }

    const { error: deleteError } = await supabase.from(LISTINGS_TABLE).delete().eq('id', listingId);

    if (deleteError) {
      throw new Error(`İlan silinemedi: ${deleteError.message}`);
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 403, { error: error.message || 'Admin silme işlemi başarısız oldu.' });
  }
}
