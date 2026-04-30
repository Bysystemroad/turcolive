import { BadgeCheck, Camera, ShieldCheck, UsersRound } from 'lucide-react';

const cards = [
  { title: 'Türk topluluğu odaklı', icon: UsersRound },
  { title: 'Fotoğraflı ilanlar', icon: Camera },
  { title: 'Daha şeffaf ev paylaşımı', icon: ShieldCheck },
  { title: 'İtalya’daki Türkler için özel', icon: BadgeCheck },
];

export default function TrustCards() {
  return (
    <section className="bg-porcelain py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:pt-3">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">Neden TurcoLive?</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-navy sm:text-5xl">
              Aynı dili konuşan, benzer beklentileri paylaşan bir topluluk.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-[2rem] border border-navy/10 bg-white p-7 shadow-card">
                  <span className="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-2xl bg-blush text-turco ring-1 ring-turco/10">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-6 text-lg font-black text-navy">{card.title}</h3>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
