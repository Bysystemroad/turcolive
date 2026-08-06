import { supabase } from '../lib/supabaseClient.js';

export async function setUserBlocked(userId, isBlocked) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) {
    throw new Error('Admin oturumu bulunamadı.');
  }

  const response = await fetch('/api/admin-block-user', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, isBlocked }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Kullanıcı durumu güncellenemedi.');
  }

  return payload.profile;
}
