export default function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-9 text-sm text-navy/62 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/10">
            <img className="h-10 w-10 object-contain" src="/brand/turcolive-logo-cropped.png" alt="" />
          </span>
          <p className="text-lg font-black text-navy">
            Turco<span className="text-turco">Live</span>
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <p>TurcoLive — İtalya’daki Türkler için ev ve oda paylaşım platformu.</p>
          <div className="flex items-center gap-3">
            <a
              className="grid h-11 w-11 place-items-center rounded-full bg-porcelain text-navy ring-1 ring-navy/10 transition hover:-translate-y-0.5 hover:bg-blush hover:text-turco"
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="TurcoLive Instagram"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="none">
                <rect width="16" height="16" x="4" y="4" rx="4.5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
                <circle cx="17" cy="7" r="1.1" fill="currentColor" />
              </svg>
            </a>
            <a
              className="grid h-11 w-11 place-items-center rounded-full bg-porcelain text-navy ring-1 ring-navy/10 transition hover:-translate-y-0.5 hover:bg-blush hover:text-turco"
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="TurcoLive Facebook"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M14.2 8.2V6.9c0-.6.4-.9 1-.9h1.6V3.2c-.8-.1-1.6-.2-2.4-.2-2.5 0-4.1 1.5-4.1 4.2v1H7.6v3.2h2.7V21h3.4v-9.6h2.6l.5-3.2h-3Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
