import { ArrowLeft, Camera, Euro, Home, Mail, MapPin, ShieldCheck, UsersRound } from 'lucide-react';

export default function ListingDetailPage({ listing, onBack, onNavigate }) {
  if (!listing) {
    return (
      <section className="bg-porcelain py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-navy/10 bg-white p-10 shadow-card">
            <h1 className="text-3xl font-black text-navy">İlan bulunamadı.</h1>
            <p className="mt-3 text-navy/60">Bu ilan yenilenmiş olabilir veya geçici fotoğraflar artık kullanılamıyor olabilir.</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-7 rounded-full bg-turco px-6 py-3 text-sm font-black text-white shadow-card transition hover:bg-coral"
            >
              İlanlara dön
            </button>
          </div>
        </div>
      </section>
    );
  }

  const imageUrls = listing.imageUrls || (listing.imageUrl ? [listing.imageUrl] : []);
  const photoCount = imageUrls.length || listing.imageFileNames?.length || 0;
  const galleryImages = imageUrls.slice(0, 5);

  return (
    <section className="bg-cream py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-navy shadow-sm ring-1 ring-navy/10 transition hover:text-turco"
        >
          <ArrowLeft size={18} />
          İlanlara geri dön
        </button>

        <div className="mt-6 overflow-hidden rounded-[2.25rem] bg-white shadow-card ring-1 ring-navy/10">
          {galleryImages.length > 0 ? (
            <div className="grid gap-2 bg-white p-2 lg:grid-cols-[1.45fr_1fr]">
              <img
                className="h-80 w-full rounded-[1.75rem] object-cover lg:h-[34rem]"
                src={galleryImages[0]}
                alt={`${listing.title} fotoğraf 1`}
              />
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {(galleryImages.length > 1 ? galleryImages.slice(1, 3) : galleryImages).map((image, index) => (
                  <img
                    key={image}
                    className="h-56 w-full rounded-[1.5rem] object-cover lg:h-[16.75rem]"
                    src={image}
                    alt={`${listing.title} fotoğraf ${index + 2}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid h-96 place-items-center bg-porcelain text-center text-navy/45">
              <div>
                <Home className="mx-auto" size={54} />
                <p className="mt-3 text-sm font-extrabold">Fotoğraflar bu oturumda görüntülenemiyor.</p>
              </div>
            </div>
          )}
        </div>

        {imageUrls.length > 3 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {imageUrls.slice(3).map((image, index) => (
              <img
                key={image}
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm ring-1 ring-navy/10"
                src={image}
                alt={`${listing.title} ek fotoğraf ${index + 4}`}
              />
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-navy shadow-sm ring-1 ring-navy/10">
            <Camera size={17} />
            {photoCount > 0 ? `${photoCount} fotoğraf` : 'Fotoğraf geçici'}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-navy shadow-sm ring-1 ring-navy/10">
            <ShieldCheck size={17} />
            Topluluk ilanı
          </span>
          {listing.targetAudience && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-navy shadow-sm ring-1 ring-navy/10">
              <UsersRound size={17} />
              {listing.targetAudience}
            </span>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">{listing.city}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">{listing.title}</h1>
            <p className="mt-4 flex items-center gap-2 text-base font-bold text-navy/62">
              <MapPin size={18} />
              {listing.city}, {listing.district}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              <InfoPill label="Oda tipi" value={listing.roomType} />
              <InfoPill label="Ev tipi" value={listing.homeType} />
              <InfoPill label="Kimin için" value={listing.targetAudience || 'Belirtilmedi'} />
              <InfoPill label="Kişi sayısı" value={`${listing.peopleCount} kişi`} />
            </div>

            <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-navy/10">
              <h2 className="text-2xl font-black text-navy">Açıklama</h2>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-navy/68">{listing.description}</p>
            </div>

            <div className="mt-5 rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-navy/10">
              <h2 className="text-2xl font-black text-navy">İletişim</h2>
              <p className="mt-4 flex items-center gap-2 text-base font-bold text-navy/68">
                <Mail size={18} />
                {listing.contact}
              </p>
            </div>
          </div>

          <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-lift ring-1 ring-navy/10 lg:sticky lg:top-28">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-turco">İlan özeti</p>
            <div className="mt-5 flex items-center gap-3 rounded-3xl bg-blush p-5 text-turco ring-1 ring-turco/10">
              <Euro size={24} />
              <div>
                <p className="text-3xl font-black">€{listing.rent}</p>
                <p className="text-sm font-bold text-navy/55">Aylık kira</p>
              </div>
            </div>
            <div className="mt-4 rounded-3xl bg-porcelain p-5">
              <p className="text-2xl font-black text-navy">€{listing.deposit}</p>
              <p className="mt-1 text-sm font-bold text-navy/55">Depozito</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ilan-ver')}
              className="mt-5 w-full rounded-full bg-turco px-5 py-4 text-sm font-black text-white shadow-card transition hover:bg-coral"
            >
              Ben de ilan vereyim
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-navy/38">{label}</p>
      <p className="mt-2 text-base font-black text-navy">{value}</p>
    </div>
  );
}
