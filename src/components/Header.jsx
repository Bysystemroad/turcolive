import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  { id: 'anasayfa', label: 'Ana Sayfa' },
  { id: 'ilanlar', label: 'İlanlar' },
  { id: 'ilan-ver', label: 'İlan Ver' },
  { id: 'nasil-calisir', label: 'Nasıl Çalışır' },
];

export default function Header({ currentPage, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const selectPage = (page) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-navy/10 bg-white/82 shadow-sm backdrop-blur-2xl' : 'bg-white/50 backdrop-blur-xl'
      }`}
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <motion.button
          type="button"
          onClick={() => selectPage('anasayfa')}
          className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-4 focus:ring-turco/15"
          aria-label="TurcoLive ana sayfa"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/10">
            <img className="h-12 w-12 object-contain" src="/brand/turcolive-symbol-cropped.png" alt="" />
          </span>
          <span className="hidden text-2xl font-black tracking-tight text-navy sm:inline">
            Turco<span className="text-turco">Live</span>
          </span>
        </motion.button>

        <nav className="hidden items-center gap-1 rounded-full border border-navy/10 bg-white/70 p-1 shadow-sm backdrop-blur-2xl md:flex" aria-label="Ana menü">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectPage(item.id)}
              className={`relative rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                currentPage === item.id ? 'text-turco' : 'text-navy/68 hover:text-navy'
              }`}
            >
              {currentPage === item.id && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-white shadow-sm"
                  layoutId="nav-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        <motion.button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-navy shadow-sm ring-1 ring-navy/10 md:hidden"
          aria-label="Menüyü aç veya kapat"
          whileTap={{ scale: 0.92 }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="border-t border-navy/10 bg-white/92 px-4 py-3 backdrop-blur-2xl md:hidden"
            aria-label="Mobil menü"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <div className="mx-auto grid max-w-7xl gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectPage(item.id)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition ${
                    currentPage === item.id ? 'bg-blush text-turco shadow-sm' : 'text-navy/75 hover:bg-porcelain'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
