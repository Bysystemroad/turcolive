import { motion } from 'framer-motion';
import { Building2, MapPin, Search, UserRound, UsersRound } from 'lucide-react';
import { cities, genderPreferences, homeTypes, roomTypes, targetAudiences } from '../data/options.js';

export default function SearchBar({ compact = false }) {
  return (
    <motion.div
      className={`premium-surface rounded-[2rem] border border-white/70 p-3 ring-1 ring-navy/5 ${compact ? '' : 'lg:-mt-11'}`}
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1fr_1fr_1fr_auto]">
        <Filter icon={MapPin}>
          <option>Şehir</option>
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </Filter>

        <Filter icon={Search}>
          <option>Oda Tipi</option>
          {roomTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </Filter>

        <Filter icon={Building2}>
          <option>Ev Tipi</option>
          {homeTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </Filter>

        <Filter icon={UsersRound}>
          <option>Kimler için?</option>
          {targetAudiences.map((audience) => (
            <option key={audience}>{audience}</option>
          ))}
        </Filter>

        <Filter icon={UserRound}>
          <option>Cinsiyet Tercihi</option>
          {genderPreferences.map((preference) => (
            <option key={preference}>{preference}</option>
          ))}
        </Filter>

        {!compact && (
          <motion.button
            className="premium-button md:col-span-2 xl:col-span-1"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Ara
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function Filter({ icon: Icon, children }) {
  return (
    <motion.label
      className="group flex items-center gap-3 rounded-3xl bg-white/80 px-4 py-3.5 ring-1 ring-navy/8 transition hover:bg-white hover:shadow-sm"
      whileHover={{ y: -2 }}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blush text-turco transition group-hover:bg-turco group-hover:text-white">
        <Icon size={19} />
      </span>
      <select className="w-full bg-transparent text-sm font-extrabold text-navy outline-none">{children}</select>
    </motion.label>
  );
}
