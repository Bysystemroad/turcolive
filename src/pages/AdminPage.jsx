import { motion } from 'framer-motion';
import { CheckCircle2, LogOut, RefreshCw, ShieldAlert, Trash2, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getCurrentAdminUser, signInAdmin, signOutAdmin } from '../services/adminAuth.js';
import { deleteListing, fetchListings, updateListingStatus } from '../services/listings.js';

const statusLabels = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  spam: 'Spam',
};

const statusClasses = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-blush text-turco ring-turco/10',
  spam: 'bg-navy text-white ring-navy/10',
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const counts = useMemo(() => {
    return ['pending', 'approved', 'rejected', 'spam'].reduce((result, status) => {
      result[status] = listings.filter((listing) => (listing.status || 'pending') === status).length;
      return result;
    }, {});
  }, [listings]);

  const loadAdminListings = async () => {
    setLoading(true);
    try {
      const data = await fetchListings({ includePending: true });
      setListings(data);
      setMessage('');
    } catch (error) {
      setMessage(error.message || 'İlanlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function checkAdminSession() {
      try {
        const adminUser = await getCurrentAdminUser();
        if (active) {
          setAuthorized(Boolean(adminUser));
          setAuthError('');
        }
      } catch (error) {
        if (active) setAuthError(error.message || 'Admin oturumu kontrol edilemedi.');
      } finally {
        if (active) setAuthChecking(false);
      }
    }

    checkAdminSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authorized) {
      loadAdminListings();
    }
  }, [authorized]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setAuthError('E-posta ve şifre alanları zorunludur.');
      return;
    }

    setAuthChecking(true);
    setAuthError('');

    try {
      await signInAdmin(email.trim(), password);
      setAuthorized(true);
      setPassword('');
    } catch (error) {
      setAuthError(error.message || 'Admin girişi yapılamadı.');
    } finally {
      setAuthChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      setAuthorized(false);
      setListings([]);
      setMessage('');
    } catch (error) {
      setMessage(error.message || 'Çıkış yapılamadı.');
    }
  };

  const handleStatusChange = async (listingId, status) => {
    const previousListings = listings;
    setListings((current) =>
      current.map((listing) => (listing.id === listingId ? { ...listing, status } : listing))
    );
    setMessage('');

    try {
      const updatedListing = await updateListingStatus(listingId, status);
      setListings((current) => current.map((listing) => (listing.id === listingId ? updatedListing : listing)));
      setMessage('');
    } catch (error) {
      setListings(previousListings);
      setMessage(error.message || 'İlan durumu güncellenemedi.');
    }
  };

  const handleDelete = async (listingId) => {
    try {
      await deleteListing(listingId);
      setListings((current) => current.filter((listing) => listing.id !== listingId));
      setMessage('');
    } catch (error) {
      setMessage(error.message || 'İlan silinemedi.');
    }
  };

  if (authChecking && !authorized) {
    return (
      <section className="soft-grid grid min-h-screen place-items-center bg-porcelain px-4 py-14">
        <div className="premium-surface w-full max-w-md rounded-[2rem] border border-white/80 p-6 text-center text-sm font-extrabold text-navy/65 shadow-card ring-1 ring-navy/5">
          Admin oturumu kontrol ediliyor.
        </div>
      </section>
    );
  }

  if (!authorized) {
    return (
      <section className="soft-grid grid min-h-screen place-items-center bg-porcelain px-4 py-14">
        <form onSubmit={handleLogin} className="premium-surface w-full max-w-md rounded-[2rem] border border-white/80 p-6 shadow-card ring-1 ring-navy/5">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">Admin</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-navy">Admin girişi</h1>
          <label className="mt-6 grid gap-2">
            <span className="label">E-posta</span>
            <input
              className={`field ${authError ? 'border-turco ring-2 ring-turco/20' : ''}`}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setAuthError('');
              }}
              autoComplete="email"
              placeholder="admin@turcolive.com"
            />
          </label>
          <label className="mt-4 grid gap-2">
            <span className="label">Şifre</span>
            <input
              className={`field ${authError ? 'border-turco ring-2 ring-turco/20' : ''}`}
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setAuthError('');
              }}
              autoComplete="current-password"
              placeholder="Şifreniz"
            />
          </label>
          {authError && <p className="mt-3 text-sm font-extrabold text-turco">{authError}</p>}
          <motion.button
            type="submit"
            disabled={authChecking}
            className="premium-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
            whileHover={{ scale: authChecking ? 1 : 1.03, y: authChecking ? 0 : -2 }}
            whileTap={{ scale: authChecking ? 1 : 0.97 }}
          >
            {authChecking ? 'Giriş yapılıyor' : 'Admin Paneline Gir'}
          </motion.button>
        </form>
      </section>
    );
  }

  return (
    <section className="soft-grid min-h-screen bg-porcelain py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">Admin</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-navy sm:text-6xl">Supabase ilan yönetimi</h1>
          </div>
          <motion.button
            type="button"
            onClick={loadAdminListings}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-navy shadow-card ring-1 ring-navy/10 transition hover:text-turco"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw size={17} />
            Yenile
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-black text-white shadow-card ring-1 ring-navy/10 transition hover:bg-turco"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut size={17} />
            Çıkış Yap
          </motion.button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {['pending', 'approved', 'rejected', 'spam'].map((status) => (
            <div key={status} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-navy/38">{statusLabels[status]}</p>
              <p className="mt-2 text-3xl font-black text-navy">{counts[status] || 0}</p>
            </div>
          ))}
        </div>

        {message && (
          <div className="mt-8 rounded-2xl bg-blush px-4 py-3 text-sm font-extrabold text-turco ring-1 ring-turco/10">
            {message}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-navy/10 bg-white shadow-card">
          {loading ? (
            <div className="p-8 text-center font-extrabold text-navy/65">İlanlar yükleniyor.</div>
          ) : listings.length === 0 ? (
            <div className="p-8 text-center font-extrabold text-navy/65">Henüz ilan bulunmuyor.</div>
          ) : (
            <div className="divide-y divide-navy/10">
              {listings.map((listing) => {
                const status = listing.status || 'pending';
                return (
                  <div key={listing.id} className="grid gap-4 p-5 lg:grid-cols-[7rem_1fr_auto] lg:items-center">
                    <div className="h-24 w-28 overflow-hidden rounded-2xl bg-porcelain ring-1 ring-navy/10">
                      {listing.imageUrls?.[0] ? (
                        <img className="h-full w-full object-cover" src={listing.imageUrls[0]} alt={listing.title} />
                      ) : (
                        <div className="grid h-full place-items-center text-xs font-black text-navy/40">Fotoğraf yok</div>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-navy">{listing.title}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClasses[status] || statusClasses.pending}`}>
                          {statusLabels[status] || status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-navy/60">
                        {listing.city}, {listing.district} · {listing.fullName || 'Ad Soyad yok'}
                      </p>
                      <p className="mt-1 text-xs font-black text-navy/45">
                        {listing.imageUrls?.length || 0} fotoğraf
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {status !== 'approved' && (
                        <ActionButton
                          label="Onayla"
                          icon={CheckCircle2}
                          onClick={() => handleStatusChange(listing.id, 'approved')}
                          className="bg-emerald-50 text-emerald-700 ring-emerald-200"
                        />
                      )}
                      {status !== 'rejected' && (
                        <ActionButton
                          label="Reddet"
                          icon={XCircle}
                          onClick={() => handleStatusChange(listing.id, 'rejected')}
                          className="bg-blush text-turco ring-turco/10"
                        />
                      )}
                      {status !== 'spam' && (
                        <ActionButton
                          label="Spam"
                          icon={ShieldAlert}
                          onClick={() => handleStatusChange(listing.id, 'spam')}
                          className="bg-navy text-white ring-navy/10"
                        />
                      )}
                      <ActionButton
                        label="Sil"
                        icon={Trash2}
                        onClick={() => handleDelete(listing.id)}
                        className="bg-white text-navy ring-navy/10"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ActionButton({ label, icon: Icon, onClick, className }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-black ring-1 ${className}`}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      <Icon size={16} />
      {label}
    </motion.button>
  );
}
