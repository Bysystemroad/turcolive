import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { id: 'anasayfa', label: 'Ana Sayfa' },
  { id: 'ilanlar', label: 'İlanlar' },
  { id: 'ilan-ver', label: 'İlan Ver' },
  { id: 'nasil-calisir', label: 'Nasıl Çalışır' },
];

export default function Header({ currentPage, onNavigate }) {
  const [open, setOpen] = useState(false);

  const selectPage = (page) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/86 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => selectPage('anasayfa')}
          className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-4 focus:ring-turco/15"
          aria-label="TurcoLive ana sayfa"
        >
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-navy/10">
            <img className="h-12 w-12 object-contain" src="/brand/turcolive-symbol-cropped.png" alt="" />
          </span>
          <span className="hidden text-2xl font-black tracking-tight text-navy sm:inline">
            Turco<span className="text-turco">Live</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-navy/10 bg-porcelain p-1 md:flex" aria-label="Ana menü">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectPage(item.id)}
              className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                currentPage === item.id
                  ? 'bg-white text-turco shadow-sm'
                  : 'text-navy/68 hover:bg-white hover:text-navy'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-porcelain text-navy shadow-sm ring-1 ring-navy/10 md:hidden"
          aria-label="Menüyü aç veya kapat"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-navy/10 bg-white px-4 py-3 md:hidden" aria-label="Mobil menü">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectPage(item.id)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-extrabold ${
                  currentPage === item.id ? 'bg-blush text-turco shadow-sm' : 'text-navy/75'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
