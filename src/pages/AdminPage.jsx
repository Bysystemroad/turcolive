import { motion } from 'framer-motion';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deleteListing, fetchListings } from '../services/listings.js';

export default function AdminPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
    loadAdminListings();
  }, []);

  const handleDelete = async (listingId) => {
    try {
      await deleteListing(listingId);
      setListings((current) => current.filter((listing) => listing.id !== listingId));
      setMessage('');
    } catch (error) {
      setMessage(error.message || 'İlan silinemedi.');
    }
  };

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
              {listings.map((listing) => (
                <div key={listing.id} className="grid gap-4 p-5 md:grid-cols-[7rem_1fr_auto] md:items-center">
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
                      <span className="rounded-full bg-blush px-3 py-1 text-xs font-black text-turco ring-1 ring-turco/10">
                        {listing.status || 'pending'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-navy/60">
                      {listing.city}, {listing.district} · {listing.fullName || 'Ad Soyad yok'}
                    </p>
                    <p className="mt-1 text-xs font-black text-navy/45">
                      {listing.imageUrls?.length || 0} fotoğraf
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => handleDelete(listing.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blush px-5 py-3 text-sm font-black text-turco ring-1 ring-turco/10"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Trash2 size={16} />
                    Sil
                  </motion.button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
