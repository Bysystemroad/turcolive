export default function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-9 text-sm text-navy/62 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/10">
            <img className="h-10 w-10 object-contain" src="/brand/turcolive-logo-cropped.png" alt="" />
          </span>
          <p className="text-lg font-black text-navy">
            Turco<span className="text-turco">Live</span>
          </p>
        </div>
        <p>TurcoLive — İtalya’daki Türkler için ev ve oda paylaşım platformu.</p>
      </div>
    </footer>
  );
}
