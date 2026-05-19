import { motion } from 'framer-motion';
import { ArrowRight, Building2, Camera, HeartHandshake, Image, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import FAQ from '../components/FAQ.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import SearchBar from '../components/SearchBar.jsx';
import TrustCards from '../components/TrustCards.jsx';
import { fadeUp, scaleIn, stagger } from '../motion.js';

export default function HomePage({ onNavigate }) {
  useEffect(() => {
    if (window.location.hash === '#nasil-calisir') {
      document.getElementById('nasil-calisir')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      <section className="hero-grid soft-grid relative overflow-hidden">
        <FloatingShape className="left-[6%] top-28 h-24 w-24 bg-turco/10" delay={0} />
        <FloatingShape className="right-[10%] top-36 h-32 w-32 bg-navy/10" delay={0.8} />
        <FloatingShape className="bottom-24 left-[48%] h-20 w-20 bg-coral/12" delay={1.2} />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:pb-24 lg:pt-24">
          <motion.div className="flex flex-col justify-center" variants={stagger} initial="hidden" animate="show">
            <motion.div
              variants={fadeUp}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-turco/15 bg-white/78 px-4 py-2 text-sm font-black text-turco shadow-sm backdrop-blur-xl"
            >
              <Sparkles size={17} />
              İtalya’daki Türk topluluğu için premium ev paylaşımı
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-8 max-w-3xl text-5xl font-black tracking-tight text-navy sm:text-7xl lg:text-8xl"
            >
              İtalya’da Türklerle aynı evi daha güvenle paylaş.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-navy/68 sm:text-xl">
              TurcoLive, İtalya’da yaşayan Türklerin ev, oda ve ev arkadaşı bulmasını daha sade, sıcak ve güven veren
              bir deneyime dönüştüren topluluk odaklı platformdur.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                onClick={() => onNavigate('ilanlar')}
                className="premium-button"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                İlanlara Göz At
                <ArrowRight size={18} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => onNavigate('ilan-ver')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/88 px-7 py-4 text-sm font-black text-navy shadow-card ring-1 ring-navy/10 backdrop-blur-xl transition hover:text-turco"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                İlan Ver
              </motion.button>
            </motion.div>
            <motion.div variants={stagger} className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {['Fotoğraflı ilan', 'Türk topluluğu', 'Rezervasyon yok'].map((item) => (
                <motion.div
                  key={item}
                  variants={scaleIn}
                  className="rounded-2xl bg-white/76 px-4 py-3 text-sm font-black text-navy shadow-sm ring-1 ring-navy/10 backdrop-blur-xl"
                  whileHover={{ y: -3 }}
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="relative" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
            <motion.div
              className="brand-gradient overflow-hidden rounded-[2.75rem] p-4 shadow-lift"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="rounded-[2.25rem] bg-white p-5 shadow-card">
                <div className="flex items-center justify-between gap-4">
                  <img className="h-20 w-20 rounded-3xl object-contain ring-1 ring-navy/10" src="/brand/turcolive-logo-cropped.png" alt="TurcoLive logosu" />
                  <span className="rounded-full bg-blush px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-turco">
                    Topluluk
                  </span>
                </div>
                <div className="mt-5 overflow-hidden rounded-[2rem]">
                  <motion.img
                    className="h-72 w-full object-cover sm:h-80"
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85"
                    alt="Modern ve sıcak bir apartman oturma alanı"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Metric value="Foto" text="Fotoğraf odaklı ilan deneyimi" />
                  <Metric value="TR" text="İtalya’daki Türkler için özel" accent />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="brand-glass mt-4 rounded-[1.75rem] border border-white/70 p-5 shadow-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.55 }}
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-turco text-white shadow-sm">
                  <Camera size={23} />
                </span>
                <div>
                  <p className="font-black text-navy">Fotoğraflarla daha net ilanlar</p>
                  <p className="mt-1 text-sm leading-6 text-navy/62">
                    İlanlarda ev veya oda fotoğrafı kullanılır; karar vermeden önce mekanı daha rahat incelersin.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="absolute right-4 top-10 hidden rounded-[1.5rem] bg-white/92 p-4 shadow-card ring-1 ring-navy/10 backdrop-blur-xl sm:block"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blush text-turco">
                  <Building2 size={20} />
                </span>
                <div>
                  <p className="text-xs font-bold text-navy/45">Odak</p>
                  <p className="text-sm font-black text-navy">Ev ve oda paylaşımı</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SearchBar />
      </section>

      <section className="bg-white px-4 pb-6 pt-20 sm:px-6 lg:px-8">
        <motion.div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          {[
            { icon: ShieldCheck, title: 'Güven hissi', text: 'Ev paylaşımında açık bilgi ve net iletişim.' },
            { icon: Image, title: 'Fotoğrafla görünür', text: 'İlan kartları mekanı fotoğrafla hızlıca anlatır.' },
            { icon: HeartHandshake, title: 'Ait hissettiren', text: 'Türkçe, sade ve İtalya’daki ihtiyaçlara odaklı.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.article key={item.title} variants={fadeUp} whileHover={{ y: -8, scale: 1.015 }} className="rounded-[2rem] border border-navy/10 bg-white p-6 shadow-card">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-turco">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-lg font-black text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy/60">{item.text}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      <HowItWorks />
      <TrustCards />
      <FAQ />

      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          className="brand-gradient mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] p-8 text-white shadow-lift sm:p-12 lg:p-16"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65 }}
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Topluluğa katıl</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                Sen de ilanını paylaş, doğru ev arkadaşını bul.
              </h2>
            </div>
            <motion.button
              type="button"
              onClick={() => onNavigate('ilan-ver')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-navy transition hover:text-turco"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              İlan Ver
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </section>
    </>
  );
}

function FloatingShape({ className, delay }) {
  return (
    <motion.span
      className={`pointer-events-none absolute rounded-full blur-2xl ${className}`}
      animate={{ y: [0, -22, 0], x: [0, 10, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 7, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function Metric({ value, text, accent = false }) {
  return (
    <motion.div className={`rounded-[1.5rem] p-5 ${accent ? 'bg-blush' : 'bg-porcelain'}`} whileHover={{ y: -4 }}>
      <p className={`text-3xl font-black ${accent ? 'text-turco' : 'text-navy'}`}>{value}</p>
      <p className="mt-1 text-sm font-bold text-navy/60">{text}</p>
    </motion.div>
  );
}
