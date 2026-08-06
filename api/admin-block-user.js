import { getSupabaseAdmin, readJson, requireAdminUser, sendJson } from './_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    await requireAdminUser(req);
    const { userId, isBlocked } = await readJson(req);

    if (!userId || typeof isBlocked !== 'boolean') {
      throw new Error('Kullanıcı ve durum bilgisi zorunludur.');
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_blocked: isBlocked, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id,full_name,email,is_blocked')
      .single();

    if (error) {
      throw new Error(`Kullanıcı durumu güncellenemedi: ${error.message}`);
    }

    sendJson(res, 200, { profile: data });
  } catch (error) {
    sendJson(res, error.statusCode || 403, { error: error.message || 'Kullanıcı durumu güncellenemedi.' });
  }
}
