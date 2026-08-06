import { motion } from 'framer-motion';
import { Mail, Lock, UserRound } from 'lucide-react';
import { useState } from 'react';
import { sendPasswordReset, signInUser, signUpUser, updatePassword } from '../services/auth.js';

export default function AuthPage({ mode, notice = '', onNavigate, onAuthSuccess }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState(notice);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        if (!form.fullName.trim()) throw new Error('Ad soyad zorunludur.');
        if (form.password.length < 8) throw new Error('Şifre en az 8 karakter olmalıdır.');
        if (form.password !== form.confirmPassword) throw new Error('Şifreler eşleşmiyor.');
        await signUpUser({ fullName: form.fullName.trim(), email: form.email.trim(), password: form.password });
        setMessage('Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın.');
      } else if (mode === 'forgot') {
        await sendPasswordReset(form.email.trim());
        setMessage('Şifre yenileme bağlantısı e-posta adresinize gönderildi.');
      } else if (mode === 'reset') {
        if (form.password.length < 8) throw new Error('Şifre en az 8 karakter olmalıdır.');
        if (form.password !== form.confirmPassword) throw new Error('Şifreler eşleşmiyor.');
        await updatePassword(form.password);
        setMessage('Şifreniz güncellendi. Giriş yapabilirsiniz.');
        onNavigate('giris');
      } else {
        await signInUser({ email: form.email.trim(), password: form.password });
        await onAuthSuccess?.();
        onNavigate('hesabim');
      }
    } catch (submitError) {
      setError(submitError.message || 'İşlem tamamlanamadı.');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    signup: 'Kayıt Ol',
    login: 'Giriş Yap',
    forgot: 'Şifremi Unuttum',
    reset: 'Şifre Yenile',
  };

  return (
    <section className="soft-grid grid min-h-[75vh] place-items-center bg-porcelain px-4 py-14">
      <motion.form
        onSubmit={handleSubmit}
        className="premium-surface w-full max-w-md rounded-[2rem] border border-white/80 p-6 shadow-card ring-1 ring-navy/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">TurcoLive</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-navy">{titles[mode]}</h1>

        {mode === 'signup' && (
          <Field icon={UserRound} label="Ad Soyad">
            <input className="field" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} />
          </Field>
        )}

        {mode !== 'reset' && (
          <Field icon={Mail} label="E-posta">
            <input className="field" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
          </Field>
        )}

        {mode !== 'forgot' && (
          <Field icon={Lock} label="Şifre">
            <input className="field" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required />
          </Field>
        )}

        {(mode === 'signup' || mode === 'reset') && (
          <Field icon={Lock} label="Şifre Tekrar">
            <input className="field" type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} required />
          </Field>
        )}

        {error && <p className="mt-4 rounded-2xl bg-blush px-4 py-3 text-sm font-extrabold text-turco ring-1 ring-turco/10">{error}</p>}
        {message && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">{message}</p>}

        <button type="submit" disabled={loading} className="premium-button mt-6 w-full disabled:opacity-60">
          {loading ? 'İşleniyor' : titles[mode]}
        </button>

        <div className="mt-5 flex flex-wrap gap-3 text-sm font-extrabold text-navy/65">
          {mode !== 'login' && <button type="button" onClick={() => onNavigate('giris')} className="hover:text-turco">Giriş Yap</button>}
          {mode !== 'signup' && <button type="button" onClick={() => onNavigate('kayit-ol')} className="hover:text-turco">Kayıt Ol</button>}
          {mode === 'login' && <button type="button" onClick={() => onNavigate('sifremi-unuttum')} className="hover:text-turco">Şifremi Unuttum</button>}
        </div>
      </motion.form>
    </section>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="mt-5 grid gap-2">
      <span className="label inline-flex items-center gap-2">
        <Icon size={16} className="text-turco" />
        {label}
      </span>
      {children}
    </label>
  );
}
