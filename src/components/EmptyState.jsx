import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

export default function EmptyState({ onNavigate }) {
  return (
    <motion.div
      className="premium-surface rounded-[2.25rem] border border-white/80 p-8 text-center ring-1 ring-navy/5 sm:p-14"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55 }}
    >
      <motion.span
        className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blush text-turco ring-1 ring-turco/10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PlusCircle size={30} />
      </motion.span>
      <h2 className="mt-6 text-3xl font-black text-navy">Henüz aktif ilan bulunmuyor.</h2>
      <p className="mx-auto mt-3 max-w-xl text-navy/65">
        İlk ilanı sen paylaşarak TurcoLive topluluğunu başlatabilirsin.
      </p>
      <motion.button
        type="button"
        onClick={() => onNavigate('ilan-ver')}
        className="premium-button mt-8"
        whileHover={{ scale: 1.04, y: -3 }}
        whileTap={{ scale: 0.97 }}
      >
        İlk ilanı paylaş
      </motion.button>
    </motion.div>
  );
}
