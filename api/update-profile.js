import { getProfileForUser, getSupabaseAdmin, readJson, requireAuthenticatedUser, sendJson } from './_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const user = await requireAuthenticatedUser(req);
    const profile = await getProfileForUser(user.id);
    if (profile?.is_blocked) {
      sendJson(res, 403, { error: 'Hesabınız ilan paylaşımına kapatılmıştır.' });
      return;
    }

    const body = await readJson(req);
    const fullName = String(body.fullName || '').trim();
    const phone = String(body.phone || '').trim();

    if (!fullName) {
      throw new Error('Ad soyad alanı zorunludur.');
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('id,full_name,email,phone,is_blocked,created_at,updated_at')
      .single();

    if (error) {
      throw new Error(`Profil güncellenemedi: ${error.message}`);
    }

    sendJson(res, 200, { profile: data });
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || 'Profil güncellenemedi.' });
  }
}
