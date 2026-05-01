import { Camera, Home, MapPin, UsersRound } from 'lucide-react';

export default function ListingCard({ listing, onOpen }) {
  const imageUrls = listing.imageUrls || (listing.imageUrl ? [listing.imageUrl] : []);
  const hasImagePreview = imageUrls.length > 0;
  const photoCount = imageUrls.length || listing.imageFileNames?.length || 0;

  return (
    <article className="overflow-hidden rounded-[2.25rem] border border-navy/10 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift">
      <button type="button" onClick={() => onOpen(listing.id)} className="block w-full text-left">
        <div className="relative aspect-[16/10] bg-porcelain">
          {hasImagePreview ? (
            <img className="h-full w-full object-cover" src={imageUrls[0]} alt={listing.title} />
          ) : (
            <div className="grid h-full place-items-center text-center text-navy/45">
              <div>
                <Home className="mx-auto" size={44} />
                {listing.imageFileNames?.length > 0 && (
                  <p className="mt-3 text-sm font-extrabold">{listing.imageFileNames.join(', ')}</p>
                )}
              </div>
            </div>
          )}
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/94 px-3 py-2 text-xs font-black text-turco shadow-sm ring-1 ring-turco/10">
            <Camera size={15} />
            {photoCount > 1 ? `${photoCount} fotoğraf` : hasImagePreview ? 'Fotoğraf eklendi' : 'Fotoğraf geçici'}
          </span>
        </div>
      </button>

      <div className="p-6 sm:p-7">
        <button type="button" onClick={() => onOpen(listing.id)} className="w-full text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-navy">{listing.title}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-navy/60">
                <MapPin size={16} />
                {listing.city}, {listing.district}
              </p>
            </div>
            <p className="rounded-2xl bg-blush px-4 py-2 text-lg font-black text-turco ring-1 ring-turco/10">€{listing.rent}</p>
          </div>
        </button>
        <div className="mt-5 grid gap-3 text-sm font-semibold text-navy/70 sm:grid-cols-4">
          <span className="rounded-2xl bg-porcelain px-3 py-2">{listing.roomType}</span>
          <span className="rounded-2xl bg-porcelain px-3 py-2">{listing.homeType}</span>
          <span className="rounded-2xl bg-porcelain px-3 py-2">{listing.targetAudience || 'Kimin için belirtilmedi'}</span>
          <span className="flex items-center gap-2 rounded-2xl bg-porcelain px-3 py-2">
            <UsersRound size={16} />
            {listing.peopleCount} kişi
          </span>
        </div>
        <p className="mt-5 line-clamp-3 text-sm leading-6 text-navy/65">{listing.description}</p>
        <div className="mt-6 rounded-2xl bg-porcelain p-4 text-sm text-navy/75">
          <span className="font-black text-navy">İletişim: </span>
          {listing.contact}
        </div>
      </div>
    </article>
  );
}
