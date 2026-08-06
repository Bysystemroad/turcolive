import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase bağlantısı yapılandırılmamış.');
  }
}

export async function getSession() {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export function onAuthChange(callback) {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return () => data.subscription.unsubscribe();
}

export async function fetchProfile(userId) {
  assertSupabaseConfigured();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id,full_name,email,phone,is_blocked,created_at,updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function signUpUser({ fullName, email, password }) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/#giris`,
    },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signInUser({ email, password }) {
  assertSupabaseConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('E-posta veya şifre hatalı.');
  return data;
}

export async function signOutUser() {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function sendPasswordReset(email) {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#sifre-yenile`,
  });
  if (error) throw new Error(error.message);
}

export async function updatePassword(password) {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export async function resendVerificationEmail(email) {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${window.location.origin}/#giris` },
  });
  if (error) throw new Error(error.message);
}
