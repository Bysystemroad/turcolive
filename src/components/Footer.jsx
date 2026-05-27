import { motion } from 'framer-motion';

const footerLinks = [
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Gizlilik Politikası', href: '/gizlilik-politikasi' },
  { label: 'Kullanım Şartları', href: '/kullanim-sartlari' },
  { label: 'İletişim', href: '/iletisim' },
];

export default function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-white">
      <motion.div
        className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-sm text-navy/62 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/10">
              <img
                className="h-11 w-11 object-contain"
                src="/brand/turcolive-logo-cropped.png"
                alt="TurcoLive logosu"
                loading="lazy"
                decoding="async"
              />
            </span>
            <p className="text-xl font-black text-navy">
              Turco<span className="text-turco">Live</span>
            </p>
          </div>
          <p className="mt-5 max-w-md text-base leading-7 text-navy/62">
            İtalya’daki Türkler için ev ve oda paylaşım platformu.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <SocialLink href="https://www.instagram.com/" label="TurcoLive Instagram">
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <rect width="16" height="16" x="4" y="4" rx="4.5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="7" r="1.1" fill="currentColor" />
              </svg>
            </SocialLink>
            <SocialLink href="https://www.facebook.com/" label="TurcoLive Facebook">
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M14.2 8.2V6.9c0-.6.4-.9 1-.9h1.6V3.2c-.8-.1-1.6-.2-2.4-.2-2.5 0-4.1 1.5-4.1 4.2v1H7.6v3.2h2.7V21h3.4v-9.6h2.6l.5-3.2h-3Z" />
              </svg>
            </SocialLink>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:justify-self-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-navy/38">Sayfalar</p>
            <nav className="mt-4 grid gap-3" aria-label="Footer menüsü">
              {footerLinks.map((link) => (
                <a key={link.href} className="font-extrabold text-navy/68 transition hover:text-turco" href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-navy/38">Durum</p>
            <p className="mt-4 rounded-2xl bg-porcelain px-4 py-3 font-extrabold text-navy">
              Topluluk odaklı MVP
            </p>
          </div>
        </div>
      </motion.div>
      <div className="border-t border-navy/10 px-4 py-5 text-center text-sm font-bold text-navy/50 sm:px-6 lg:px-8">
        © 2026 TurcoLive
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <motion.a
      className="grid h-11 w-11 place-items-center rounded-full bg-porcelain text-navy ring-1 ring-navy/10 transition hover:bg-blush hover:text-turco"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      whileHover={{ y: -3, scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
    >
      {children}
    </motion.a>
  );
}
