import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { fadeUp, stagger } from '../motion.js';

export default function CitySeoPage({ cityPage, listings, loading, error, onRetry, onNavigate, onOpenListing }) {
  const cityListings = listings.filter((listing) => listing.city === cityPage.city);

  return (
    <section className="soft-grid relative overflow-hidden bg-porcelain py-14 sm:py-20">
      <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-turco/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-navy/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div className="max-w-4xl" variants={stagger} initial="hidden" animate="show">
          <motion.p variants={fadeUp} className="text-sm font-black uppercase tracking-[0.2em] text-turco">
            Şehir rehberi
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-4 text-4xl font-black tracking-tight text-navy sm:text-6xl">
            {cityPage.heading}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-3xl text-lg leading-8 text-navy/65">
            {cityPage.intro}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="button"
              onClick={() => onNavigate('ilan-ver')}
              className="premium-button"
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              İlan Ver
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => onNavigate('ilanlar')}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-black text-navy shadow-card ring-1 ring-navy/10 transition hover:text-turco"
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              Tüm ilanları gör
            </motion.button>
          </motion.div>
        </motion.div>

        <div className="mt-12">
          {loading ? (
            <StatusCard title="İlanlar yükleniyor." text={`${cityPage.city} ilanları Supabase üzerinden alınıyor.`} />
          ) : error ? (
            <motion.div
              className="rounded-[2rem] border border-turco/15 bg-white p-10 text-center shadow-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-black text-navy">İlanlar yüklenemedi.</h2>
              <p className="mx-auto mt-3 max-w-2xl text-navy/65">{error}</p>
              {onRetry && (
                <motion.button
                  type="button"
                  onClick={onRetry}
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-blush px-6 py-3 text-sm font-black text-turco ring-1 ring-turco/10"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <RefreshCw size={17} />
                  Tekrar Dene
                </motion.button>
              )}
            </motion.div>
          ) : cityListings.length === 0 ? (
            <EmptyState onNavigate={onNavigate} />
          ) : (
            <motion.div className="grid gap-6 lg:grid-cols-2" variants={stagger} initial="hidden" animate="show">
              {cityListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onOpen={onOpenListing} />
              ))}
            </motion.div>
          )}
        </div>

        <motion.div
          className="mt-14 rounded-[2rem] bg-white p-7 shadow-card ring-1 ring-navy/10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-black text-navy">{cityPage.city} için Türk ev arkadaşı arayanlara özel</h2>
          <p className="mt-4 max-w-4xl leading-8 text-navy/65">
            TurcoLive, İtalya’da yaşayan Türklerin şehir bazlı oda, ev ve ev arkadaşı ilanlarını daha kolay bulması için
            tasarlanmıştır. Ödeme veya rezervasyon sistemi değildir; ilanları inceler, uygun kişiyle doğrudan iletişime
            geçersin.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function StatusCard({ title, text }) {
  return (
    <motion.div
      className="rounded-[2rem] border border-navy/10 bg-white p-10 text-center shadow-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-black text-navy">{title}</h2>
      <p className="mt-3 text-navy/65">{text}</p>
    </motion.div>
  );
}
