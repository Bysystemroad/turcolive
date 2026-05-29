import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase bağlantısı yapılandırılmamış.');
  }
}

async function getAdminRecord(userId) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id,email')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Admin yetkisi kontrol edilemedi: ${error.message}`);
  }

  return data;
}

export async function getCurrentAdminUser() {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Oturum kontrol edilemedi: ${error.message}`);
  }

  const user = data.session?.user;
  if (!user) return null;

  const adminRecord = await getAdminRecord(user.id);
  return adminRecord ? user : null;
}

export async function signInAdmin(email, password) {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error('E-posta veya şifre hatalı.');
  }

  const adminRecord = await getAdminRecord(data.user.id);
  if (!adminRecord) {
    await supabase.auth.signOut();
    throw new Error('Bu kullanıcı admin yetkisine sahip değil.');
  }

  return data.user;
}

export async function signOutAdmin() {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Çıkış yapılamadı: ${error.message}`);
  }
}
