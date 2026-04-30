import { ArrowRight, BadgeCheck, Building2, Camera, HeartHandshake, Image, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import TrustCards from '../components/TrustCards.jsx';

export default function HomePage({ onNavigate }) {
  useEffect(() => {
    if (window.location.hash === '#nasil-calisir') {
      document.getElementById('nasil-calisir')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <>
      <section className="hero-grid overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:pb-24 lg:pt-24">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-turco/15 bg-white px-4 py-2 text-sm font-black text-turco shadow-sm">
              <HeartHandshake size={18} />
              İtalya’daki Türk topluluğu için
            </div>
            <h1 className="mt-8 max-w-3xl text-4xl font-black tracking-tight text-navy sm:text-6xl lg:text-7xl">
              İtalya’da Türklerle Aynı Evi Paylaş
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-navy/68">
              TurcoLive, İtalya’da yaşayan Türklerin güvenilir ev, oda ve ev arkadaşı bulmasını kolaylaştıran topluluk
              odaklı bir platformdur.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onNavigate('ilanlar')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-turco px-7 py-4 text-sm font-black text-white shadow-card transition hover:-translate-y-0.5 hover:bg-coral"
              >
                İlanlara Göz At
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('ilan-ver')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-black text-navy shadow-card ring-1 ring-navy/10 transition hover:-translate-y-0.5 hover:text-turco"
              >
                İlan Ver
              </button>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {['Fotoğraflı ilan', 'Türk topluluğu', 'Rezervasyon yok'].map((item) => (
                <div key={item} className="rounded-2xl bg-white/76 px-4 py-3 text-sm font-black text-navy shadow-sm ring-1 ring-navy/10">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="brand-gradient overflow-hidden rounded-[2.5rem] p-4 shadow-lift">
              <div className="rounded-[2rem] bg-white p-5 shadow-card">
                <div className="flex items-center justify-between gap-4">
                  <img className="h-20 w-20 rounded-3xl object-contain ring-1 ring-navy/10" src="/brand/turcolive-logo-cropped.png" alt="TurcoLive logosu" />
                  <span className="rounded-full bg-blush px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-turco">
                    Topluluk
                  </span>
                </div>
                <div className="mt-5 overflow-hidden rounded-[1.75rem]">
                  <img
                    className="h-72 w-full object-cover sm:h-80"
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85"
                    alt="Modern ve sıcak bir apartman oturma alanı"
                  />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-porcelain p-5">
                    <p className="text-3xl font-black text-navy">Foto</p>
                    <p className="mt-1 text-sm font-bold text-navy/55">Fotoğraf odaklı ilan deneyimi</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-blush p-5">
                    <p className="text-3xl font-black text-turco">TR</p>
                    <p className="mt-1 text-sm font-bold text-navy/60">İtalya’daki Türkler için özel</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="brand-glass mt-4 rounded-[1.75rem] border border-white/70 p-5 shadow-card">
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
            </div>
            <div className="absolute right-4 top-10 hidden rounded-[1.5rem] bg-white p-4 shadow-card ring-1 ring-navy/10 sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blush text-turco">
                  <Building2 size={20} />
                </span>
                <div>
                  <p className="text-xs font-bold text-navy/45">Odak</p>
                  <p className="text-sm font-black text-navy">Ev ve oda paylaşımı</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SearchBar />
      </section>

      <section className="bg-white px-4 pb-6 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Güven hissi', text: 'Ev paylaşımında açık bilgi ve net iletişim.' },
            { icon: Image, title: 'Fotoğrafla görünür', text: 'İlan kartları mekanı fotoğrafla hızlıca anlatır.' },
            { icon: HeartHandshake, title: 'Ait hissettiren', text: 'Türkçe, sade ve İtalya’daki ihtiyaçlara odaklı.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[2rem] border border-navy/10 bg-white p-6 shadow-card">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-turco">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-lg font-black text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy/60">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <HowItWorks />
      <TrustCards />

      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="brand-gradient mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] p-8 text-white shadow-lift sm:p-12 lg:p-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Topluluğa katıl</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                Sen de ilanını paylaş, doğru ev arkadaşını bul.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ilan-ver')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-navy transition hover:text-turco"
            >
              İlan Ver
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
