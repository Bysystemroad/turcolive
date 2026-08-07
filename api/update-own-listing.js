import {
  getProfileForUser,
  getSupabaseAdmin,
  LISTINGS_TABLE,
  readJson,
  requireAuthenticatedUser,
  sendJson,
} from './_supabaseAdmin.js';

const EDITABLE_FIELDS = {
  fullName: 'full_name',
  title: 'title',
  city: 'city',
  district: 'address',
  rent: 'monthly_rent',
  deposit: 'deposit',
  roomType: 'room_type',
  homeType: 'house_type',
  targetAudience: 'target_group',
  genderPreference: 'gender_preference',
  peopleCount: 'people_count',
  description: 'description',
  contact: 'contact_info',
  phoneNumber: 'phone_number',
};

function cleanPatch(payload) {
  const patch = {};

  Object.entries(EDITABLE_FIELDS).forEach(([frontendKey, dbKey]) => {
    if (Object.prototype.hasOwnProperty.call(payload, frontendKey)) {
      const value = String(payload[frontendKey] || '').trim();
      if (!value) {
        throw new Error('Tüm zorunlu ilan alanları doldurulmalıdır.');
      }
      patch[dbKey] = value;
    }
  });

  if (Object.keys(patch).length === 0) {
    throw new Error('Güncellenecek ilan bilgisi bulunamadı.');
  }

  patch.status = 'pending';
  return patch;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const user = await requireAuthenticatedUser(req);
    const profile = await getProfileForUser(user.id);

    if (!user.email_confirmed_at) {
      sendJson(res, 403, { error: 'İlan düzenlemek için e-posta adresinizi doğrulamalısınız.' });
      return;
    }

    if (profile?.is_blocked) {
      sendJson(res, 403, { error: 'Hesabınız ilan paylaşımına kapatılmıştır.' });
      return;
    }

    const payload = await readJson(req);
    const listingId = String(payload.listingId || '').trim();

    if (!listingId) {
      throw new Error('İlan bulunamadı.');
    }

    const { data: listing, error: listingError } = await supabase
      .from(LISTINGS_TABLE)
      .select('id,user_id,status')
      .eq('id', listingId)
      .maybeSingle();

    if (listingError || !listing) {
      throw new Error('İlan bulunamadı.');
    }

    if (listing.user_id !== user.id) {
      sendJson(res, 403, { error: 'Bu ilanı düzenleme yetkiniz yok.' });
      return;
    }

    if ((listing.status || 'pending') === 'spam') {
      sendJson(res, 403, { error: 'Bu ilan yönetici tarafından spam olarak işaretlendiği için düzenlenemez.' });
      return;
    }

    if (!['pending', 'approved', 'rejected'].includes(listing.status || 'pending')) {
      sendJson(res, 403, { error: 'Bu ilan şu anda düzenlenemez.' });
      return;
    }

    const patch = cleanPatch(payload);
    const { data, error } = await supabase
      .from(LISTINGS_TABLE)
      .update(patch)
      .eq('id', listingId)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`İlan güncellenemedi: ${error.message}`);
    }

    sendJson(res, 200, { listing: data });
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || 'İlan güncellenemedi.' });
  }
}
