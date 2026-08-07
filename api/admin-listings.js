import { getSupabaseAdmin, LISTINGS_TABLE, requireAdminUser, sendJson } from './_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    await requireAdminUser(req);

    const { data: listings, error: listingsError } = await supabase
      .from(LISTINGS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (listingsError) {
      throw new Error(`İlanlar yüklenemedi: ${listingsError.message}`);
    }

    const userIds = [...new Set((listings || []).map((listing) => listing.user_id).filter(Boolean))];
    let profilesById = {};

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id,full_name,email,phone,is_blocked')
        .in('id', userIds);

      if (profilesError) {
        throw new Error(`Kullanıcı bilgileri yüklenemedi: ${profilesError.message}`);
      }

      profilesById = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]));
    }

    sendJson(res, 200, {
      listings: (listings || []).map((listing) => ({
        ...listing,
        profiles: profilesById[listing.user_id] || null,
      })),
    });
  } catch (error) {
    sendJson(res, 403, { error: error.message || 'Admin ilanları yüklenemedi.' });
  }
}
