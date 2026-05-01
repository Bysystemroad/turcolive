import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import ListingCard from '../components/ListingCard.jsx';
import { cities, homeTypes, roomTypes } from '../data/options.js';

const defaultFilters = {
  city: '',
  roomType: '',
  homeType: '',
};

export default function ListingsPage({ listings, onNavigate, onOpenListing }) {
  const [filters, setFilters] = useState(defaultFilters);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (filters.city && listing.city !== filters.city) return false;
      if (filters.roomType && listing.roomType !== filters.roomType) return false;
      if (filters.homeType && listing.homeType !== filters.homeType) return false;
      return true;
    });
  }, [filters, listings]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section className="bg-porcelain py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">İlanlar</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-navy sm:text-6xl">
              Ev, oda ve ev arkadaşı ilanları
            </h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ilan-ver')}
            className="rounded-full bg-turco px-7 py-3.5 text-sm font-black text-white shadow-card transition hover:-translate-y-0.5 hover:bg-coral"
          >
            İlan Ver
          </button>
        </div>

        <div className="mt-10 rounded-[2rem] border border-navy/10 bg-white p-4 shadow-card">
          <div className="grid gap-3 md:grid-cols-3">
            <select className="field" value={filters.city} onChange={(event) => updateFilter('city', event.target.value)}>
              <option value="">Şehir</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              className="field"
              value={filters.roomType}
              onChange={(event) => updateFilter('roomType', event.target.value)}
            >
              <option value="">Oda tipi</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="field"
              value={filters.homeType}
              onChange={(event) => updateFilter('homeType', event.target.value)}
            >
              <option value="">Ev tipi</option>
              {homeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          {listings.length === 0 ? (
            <EmptyState onNavigate={onNavigate} />
          ) : filteredListings.length === 0 ? (
            <div className="rounded-[2rem] border border-navy/10 bg-white p-10 text-center shadow-card">
              <h2 className="text-2xl font-black text-navy">Bu filtrelerle eşleşen ilan bulunmuyor.</h2>
              <p className="mt-3 text-navy/65">Filtreleri değiştirerek tekrar deneyebilirsin.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onOpen={onOpenListing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
