import { motion } from 'framer-motion';
import { Camera, Home, MapPin, MessageCircle, UserRound, UsersRound } from 'lucide-react';

function getWhatsappLink(contact) {
  const digits = String(contact || '').replace(/\D/g, '');
  return digits.length >= 10 ? `https://wa.me/${digits}` : '';
}

export default function ListingCard({ listing, onOpen }) {
  const imageUrls = listing.imageUrls || (listing.imageUrl ? [listing.imageUrl] : []);
  const hasImagePreview = imageUrls.length > 0;
  const photoCount = imageUrls.length || listing.imageFileNames?.length || 0;
  const whatsappLink = getWhatsappLink(listing.contact);

  return (
    <motion.article
      className="group overflow-hidden rounded-[2.25rem] border border-navy/10 bg-white shadow-card"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, scale: 1.012 }}
    >
      <button type="button" onClick={() => onOpen(listing.id)} className="block w-full text-left">
        <div className="relative aspect-[16/10] overflow-hidden bg-porcelain">
          {hasImagePreview ? (
            <motion.img
              className="h-full w-full object-cover"
              src={imageUrls[0]}
              alt={listing.title}
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.5 }}
            />
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
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy/40 to-transparent opacity-80" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/94 px-3 py-2 text-xs font-black text-turco shadow-sm ring-1 ring-turco/10 backdrop-blur-xl">
            <Camera size={15} />
            {photoCount > 1 ? `${photoCount} fotoğraf` : hasImagePreview ? 'Fotoğraf eklendi' : 'Fotoğraf geçici'}
          </span>
          {listing.targetAudience && (
            <span className="absolute bottom-4 left-4 rounded-full bg-navy/82 px-3 py-2 text-xs font-black text-white backdrop-blur-xl">
              {listing.targetAudience}
            </span>
          )}
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
        <div className="mt-5 grid gap-3 text-sm font-semibold text-navy/70 sm:grid-cols-5">
          <span className="rounded-2xl bg-porcelain px-3 py-2">{listing.roomType}</span>
          <span className="rounded-2xl bg-porcelain px-3 py-2">{listing.homeType}</span>
          <span className="rounded-2xl bg-porcelain px-3 py-2">{listing.targetAudience || 'Kimler için belirtilmedi'}</span>
          <span className="flex items-center gap-2 rounded-2xl bg-porcelain px-3 py-2">
            <UserRound size={16} />
            {listing.genderPreference || 'Fark Etmez'}
          </span>
          <span className="flex items-center gap-2 rounded-2xl bg-porcelain px-3 py-2">
            <UsersRound size={16} />
            {listing.peopleCount} kişi
          </span>
        </div>
        <p className="mt-5 line-clamp-3 text-sm leading-6 text-navy/65">{listing.description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <motion.button
            type="button"
            onClick={() => onOpen(listing.id)}
            className="flex-1 rounded-full bg-navy px-5 py-3 text-sm font-black text-white transition hover:bg-ink"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            İlanı İncele
          </motion.button>
          {whatsappLink ? (
            <motion.a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#20B15A] px-5 py-3 text-sm font-black text-white shadow-sm"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <MessageCircle size={17} />
              WhatsApp
            </motion.a>
          ) : (
            <motion.button
              type="button"
              onClick={() => onOpen(listing.id)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-porcelain px-5 py-3 text-sm font-black text-navy transition hover:bg-blush hover:text-turco"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <MessageCircle size={17} />
              İletişim
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
