import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { cities, genderPreferences, homeTypes, roomTypes, targetAudiences } from '../data/options.js';
import { fadeUp, stagger } from '../motion.js';

const defaultFilters = {
  city: '',
  roomType: '',
  homeType: '',
  targetAudience: '',
  genderPreference: '',
};

export default function ListingsPage({ listings, onNavigate, onOpenListing }) {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (filters.city && listing.city !== filters.city) return false;
      if (filters.roomType && listing.roomType !== filters.roomType) return false;
      if (filters.homeType && listing.homeType !== filters.homeType) return false;
      if (filters.targetAudience && listing.targetAudience !== filters.targetAudience) return false;
      if (filters.genderPreference && listing.genderPreference !== filters.genderPreference) return false;
      return true;
    });
  }, [filters, listings]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section className="soft-grid relative overflow-hidden bg-porcelain py-14 sm:py-20">
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-turco/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" variants={stagger} initial="hidden" animate="show">
          <div>
            <motion.p variants={fadeUp} className="text-sm font-black uppercase tracking-[0.2em] text-turco">İlanlar</motion.p>
            <motion.h1 variants={fadeUp} className="mt-4 text-4xl font-black tracking-tight text-navy sm:text-6xl">
              Ev, oda ve ev arkadaşı ilanları
            </motion.h1>
          </div>
          <motion.button
            type="button"
            onClick={() => onNavigate('ilan-ver')}
            className="premium-button"
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            İlan Ver
          </motion.button>
        </motion.div>

        <motion.div
          className="premium-surface mt-10 rounded-[2rem] border border-white/80 p-4 ring-1 ring-navy/5"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <select className="field" value={filters.city} onChange={(event) => updateFilter('city', event.target.value)}>
              <option value="">Şehir</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select className="field" value={filters.roomType} onChange={(event) => updateFilter('roomType', event.target.value)}>
              <option value="">Oda tipi</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select className="field" value={filters.homeType} onChange={(event) => updateFilter('homeType', event.target.value)}>
              <option value="">Ev tipi</option>
              {homeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select className="field" value={filters.targetAudience} onChange={(event) => updateFilter('targetAudience', event.target.value)}>
              <option value="">Kimler için?</option>
              {targetAudiences.map((audience) => (
                <option key={audience} value={audience}>
                  {audience}
                </option>
              ))}
            </select>
            <select className="field" value={filters.genderPreference} onChange={(event) => updateFilter('genderPreference', event.target.value)}>
              <option value="">Cinsiyet Tercihi</option>
              {genderPreferences.map((preference) => (
                <option key={preference} value={preference}>
                  {preference}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="mt-8">
          {listings.length === 0 ? (
            <EmptyState onNavigate={onNavigate} />
          ) : filteredListings.length === 0 ? (
            <motion.div
              className="rounded-[2rem] border border-navy/10 bg-white p-10 text-center shadow-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-black text-navy">Bu filtrelerle eşleşen ilan bulunmuyor.</h2>
              <p className="mt-3 text-navy/65">Filtreleri değiştirerek tekrar deneyebilirsin.</p>
            </motion.div>
          ) : (
            <motion.div className="grid gap-6 lg:grid-cols-2" variants={stagger} initial="hidden" animate="show">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onOpen={onOpenListing} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
