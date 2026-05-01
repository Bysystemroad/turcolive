import { MapPin, Search } from 'lucide-react';
import { cities, homeTypes, roomTypes } from '../data/options.js';

export default function SearchBar({ compact = false }) {
  return (
    <div className={`rounded-[2rem] border border-navy/10 bg-white p-3 shadow-lift ${compact ? '' : 'lg:-mt-11'}`}>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-[1.15fr_1fr_1fr_auto]">
        <label className="flex items-center gap-3 rounded-3xl bg-porcelain px-4 py-3.5 ring-1 ring-navy/5">
          <MapPin className="shrink-0 text-turco" size={20} />
          <select className="w-full bg-transparent text-sm font-extrabold text-navy outline-none">
            <option>Şehir</option>
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-3xl bg-porcelain px-4 py-3.5 ring-1 ring-navy/5">
          <Search className="shrink-0 text-turco" size={20} />
          <select className="w-full bg-transparent text-sm font-extrabold text-navy outline-none">
            <option>Oda Tipi</option>
            {roomTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-3xl bg-porcelain px-4 py-3.5 ring-1 ring-navy/5">
          <Search className="shrink-0 text-turco" size={20} />
          <select className="w-full bg-transparent text-sm font-extrabold text-navy outline-none">
            <option>Ev Tipi</option>
            {homeTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        {!compact && (
          <button className="rounded-3xl bg-turco px-7 py-3.5 text-sm font-black text-white shadow-card transition hover:bg-coral md:col-span-3 lg:col-span-1">
            Ara
          </button>
        )}
      </div>
    </div>
  );
}
