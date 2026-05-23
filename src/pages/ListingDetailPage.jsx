import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Euro, Home, Mail, MapPin, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { useState } from 'react';
import PhotoLightbox from '../components/PhotoLightbox.jsx';
import { fadeUp, stagger } from '../motion.js';

export default function ListingDetailPage({ listing, onBack, onNavigate }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!listing) {
    return (
      <section className="bg-porcelain py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div className="rounded-[2rem] border border-navy/10 bg-white p-10 shadow-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-navy">İlan bulunamadı.</h1>
            <p className="mt-3 text-navy/60">Bu ilan yenilenmiş olabilir veya geçici fotoğraflar artık kullanılamıyor olabilir.</p>
            <motion.button
              type="button"
              onClick={onBack}
              className="premium-button mt-7"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              İlanlara dön
            </motion.button>
          </motion.div>
        </div>
      </section>
    );
  }

  const imageUrls = listing.imageUrls || (listing.imageUrl ? [listing.imageUrl] : []);
  const photoCount = imageUrls.length || listing.imageFileNames?.length || 0;
  const hasImages = imageUrls.length > 0;

  return (
    <>
      <section className="soft-grid bg-cream py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-navy shadow-sm ring-1 ring-navy/10 transition hover:text-turco"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -3 }}
          >
            <ArrowLeft size={18} />
            İlanlara geri dön
          </motion.button>

          <motion.div
            className="mt-6 overflow-hidden rounded-[2.25rem] bg-white p-2 shadow-lift ring-1 ring-navy/10"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            {hasImages ? (
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="block w-full overflow-hidden rounded-[1.75rem] bg-porcelain"
                aria-label="Fotoğraf görüntüleyiciyi aç"
              >
                <motion.img
                  className="h-80 w-full object-contain sm:h-[30rem] lg:h-[34rem]"
                  src={imageUrls[0]}
                  alt={`${listing.title} fotoğraf 1`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.35 }}
                />
              </button>
            ) : (
              <div className="grid h-96 place-items-center rounded-[1.75rem] bg-porcelain text-center text-navy/45">
                <div>
                  <Home className="mx-auto" size={54} />
                  <p className="mt-3 text-sm font-extrabold">Fotoğraflar bu oturumda görüntülenemiyor.</p>
                </div>
              </div>
            )}
          </motion.div>

          {imageUrls.length > 1 && (
            <motion.div className="mt-4 flex gap-3 overflow-x-auto pb-2" variants={stagger} initial="hidden" animate="show">
              {imageUrls.map((image, index) => (
                <motion.button
                  key={image}
                  type="button"
                  variants={fadeUp}
                  onClick={() => setLightboxIndex(index)}
                  className="h-20 w-28 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/10 transition hover:ring-turco/50 sm:h-24 sm:w-36"
                  whileHover={{ y: -4, scale: 1.02 }}
                  aria-label={`${index + 1}. fotoğrafı aç`}
                >
                  <img
                    className="h-full w-full object-cover"
                    src={image}
                    alt={`${listing.title} küçük fotoğraf ${index + 1}`}
                  />
                </motion.button>
              ))}
            </motion.div>
          )}

          <motion.div className="mt-5 flex flex-wrap gap-3" variants={stagger} initial="hidden" animate="show">
            <Badge icon={Camera}>{photoCount > 0 ? `${photoCount} fotoğraf` : 'Fotoğraf geçici'}</Badge>
            <Badge icon={ShieldCheck}>Topluluk ilanı</Badge>
            {listing.targetAudience && <Badge icon={UsersRound}>{listing.targetAudience}</Badge>}
            {listing.genderPreference && <Badge icon={UserRound}>{listing.genderPreference}</Badge>}
          </motion.div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.p variants={fadeUp} className="text-sm font-black uppercase tracking-[0.2em] text-turco">{listing.city}</motion.p>
              <motion.h1 variants={fadeUp} className="mt-3 text-4xl font-black tracking-tight text-navy sm:text-5xl">{listing.title}</motion.h1>
              <motion.p variants={fadeUp} className="mt-4 flex items-center gap-2 text-base font-bold text-navy/62">
                <MapPin size={18} />
                {listing.city}, {listing.district}
              </motion.p>

              <motion.div className="mt-8 grid gap-3 sm:grid-cols-5" variants={stagger}>
                <InfoPill label="Oda tipi" value={listing.roomType} />
                <InfoPill label="Ev tipi" value={listing.homeType} />
                <InfoPill label="Kimler için?" value={listing.targetAudience || 'Belirtilmedi'} />
                <InfoPill label="Cinsiyet tercihi" value={listing.genderPreference || 'Belirtilmedi'} />
                <InfoPill label="Kişi sayısı" value={`${listing.peopleCount} kişi`} />
              </motion.div>

              <motion.div variants={fadeUp} className="mt-8 rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-navy/10">
                <h2 className="text-2xl font-black text-navy">Açıklama</h2>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-navy/68">{listing.description}</p>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-5 rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-navy/10">
                <h2 className="text-2xl font-black text-navy">İletişim</h2>
                <p className="mt-4 flex items-center gap-2 text-base font-bold text-navy/68">
                  <Mail size={18} />
                  {listing.contact}
                </p>
              </motion.div>
            </motion.div>

            <motion.aside
              className="h-fit rounded-[2rem] bg-white p-6 shadow-lift ring-1 ring-navy/10 lg:sticky lg:top-28"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
            >
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
              <motion.button
                type="button"
                onClick={() => onNavigate('ilan-ver')}
                className="premium-button mt-5 w-full"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                Ben de ilan vereyim
              </motion.button>
            </motion.aside>
          </div>
        </div>
      </section>

      <PhotoLightbox
        images={imageUrls}
        currentIndex={lightboxIndex}
        title={listing.title}
        onChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}

function Badge({ icon: Icon, children }) {
  return (
    <motion.span variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-navy shadow-sm ring-1 ring-navy/10">
      <Icon size={17} />
      {children}
    </motion.span>
  );
}

function InfoPill({ label, value }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/10">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-navy/38">{label}</p>
      <p className="mt-2 text-base font-black text-navy">{value}</p>
    </motion.div>
  );
}
