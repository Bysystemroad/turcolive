import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function AccountPage({ user, profile, notice = '', requiresCompletion = false, onNavigate, onProfileUpdated }) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const verified = Boolean(user?.email_confirmed_at);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
  }, [profile?.full_name, profile?.phone]);

  const handlePhoneChange = (value) => {
    setPhone(value.replace(/[^\d+\s]/g, ''));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (saving) return;

    const normalizedPhone = phone.trim();
    if (!fullName.trim()) {
      setError('Ad soyad alanı zorunludur.');
      setMessage('');
      return;
    }

    if (!normalizedPhone) {
      setError('Telefon alanı zorunludur.');
      setMessage('');
      return;
    }

    if (normalizedPhone && !normalizedPhone.startsWith('+')) {
      setError('Telefon numaranızı ülke koduyla birlikte girin.');
      setMessage('');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName: fullName.trim(), phone: normalizedPhone }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Profil güncellenemedi.');
      await onProfileUpdated?.();
      setMessage('Profiliniz başarıyla kaydedildi.');
      if (requiresCompletion) {
        window.setTimeout(() => {
          onNavigate('ilan-ver');
        }, 900);
      }
    } catch (saveError) {
      setError(saveError.message || 'Profil güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <section className="bg-porcelain px-4 py-20 text-center">
        <p className="text-lg font-black text-navy">Hesabınızı görmek için giriş yapmalısınız.</p>
        <button className="premium-button mt-6" onClick={() => onNavigate('giris')}>Giriş Yap</button>
      </section>
    );
  }

  return (
    <section className="soft-grid bg-porcelain px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="premium-surface rounded-[2.5rem] border border-white/80 p-6 shadow-card ring-1 ring-navy/5 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">Hesabım</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-navy">Profil bilgileriniz</h1>
          {notice && (
            <div className="mt-6 rounded-2xl bg-blush px-4 py-3 text-sm font-extrabold text-turco ring-1 ring-turco/10">
              {notice}
            </div>
          )}
          {!verified && (
            <div className="mt-6 rounded-2xl bg-blush px-4 py-3 text-sm font-extrabold text-turco ring-1 ring-turco/10">
              İlan vermek için e-posta adresinizi doğrulamalısınız.
            </div>
          )}
          {profile?.is_blocked && (
            <div className="mt-6 rounded-2xl bg-blush px-4 py-3 text-sm font-extrabold text-turco ring-1 ring-turco/10">
              Hesabınız ilan paylaşımına kapatılmıştır.
            </div>
          )}

          <form onSubmit={saveProfile} className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Ad Soyad</span>
              <input className="field" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="label">Telefon</span>
              <input
                className="field"
                value={phone}
                placeholder="+39 345 123 4567"
                inputMode="tel"
                onChange={(event) => handlePhoneChange(event.target.value)}
              />
            </label>
            <label className="grid gap-2 sm:col-span-2">
              <span className="label">E-posta</span>
              <input className="field" value={user.email || ''} disabled />
            </label>
            {message && <p className="text-sm font-extrabold text-emerald-700 sm:col-span-2">{message}</p>}
            {error && <p className="text-sm font-extrabold text-turco sm:col-span-2">{error}</p>}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button className="premium-button" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Profili Kaydet'}</button>
              <button type="button" className="rounded-full bg-white px-6 py-3 text-sm font-black text-navy shadow-sm ring-1 ring-navy/10" onClick={() => onNavigate('ilanlarim')}>
                İlanlarım
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
