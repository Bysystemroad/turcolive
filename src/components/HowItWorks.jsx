import { Home, MessageCircle, SearchCheck, UserRound } from 'lucide-react';

const steps = [
  { title: 'Profilini oluştur', icon: UserRound },
  { title: 'İlanları incele', icon: SearchCheck },
  { title: 'Ev sahibi veya ev arkadaşı ile iletişime geç', icon: MessageCircle },
  { title: 'Yeni evine taşın', icon: Home },
];

export default function HowItWorks() {
  return (
    <section id="nasil-calisir" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">Nasıl Çalışır?</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-navy sm:text-5xl">
            Doğru evi bulmak sade ve güven veren bir süreç olmalı.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="group rounded-[2rem] border border-navy/10 bg-porcelain p-6 shadow-card transition hover:-translate-y-1 hover:bg-white hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-2xl bg-white text-turco shadow-sm ring-1 ring-navy/5 transition group-hover:bg-turco group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <span className="text-sm font-black text-navy/25">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-8 text-lg font-black leading-snug text-navy">{step.title}</h3>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
