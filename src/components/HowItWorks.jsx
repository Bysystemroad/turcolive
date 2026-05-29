import { motion } from 'framer-motion';
import { Home, MessageCircle, SearchCheck, UserRound } from 'lucide-react';
import { fadeUp, stagger } from '../motion.js';

const steps = [
  { title: 'İlanları filtrele', icon: SearchCheck, text: 'Şehir, oda tipi, ev tipi ve kimler için filtreleriyle sana uygun ilanları hızlıca bul.' },
  { title: 'Sana uygun kişiyi bul', icon: UserRound, text: 'Yaşam düzeni, bütçe ve beklentilerine uyan Türk ev arkadaşı adaylarını incele.' },
  { title: 'WhatsApp ile iletişim kur', icon: MessageCircle, text: 'Aracı olmadan ilan sahibiyle tek tıkla WhatsApp üzerinden doğrudan konuş.' },
  { title: 'Yeni evine taşın', icon: Home, text: 'Detayları netleştir, güvenle anlaş ve İtalya’daki yeni ev düzenine geç.' },
];

export default function HowItWorks() {
  return (
    <section id="nasil-calisir" className="relative overflow-hidden bg-white py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-navy/10 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div className="max-w-2xl" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={fadeUp} className="text-sm font-black uppercase tracking-[0.2em] text-turco">Nasıl Çalışır?</motion.p>
          <motion.h2 variants={fadeUp} className="mt-4 text-3xl font-black tracking-tight text-navy sm:text-5xl">
            Türk ev arkadaşını bul, dakikalar içinde iletişime geç.
          </motion.h2>
        </motion.div>
        <motion.div className="mt-12 grid gap-5 md:grid-cols-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                variants={fadeUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group rounded-[2rem] border border-navy/10 bg-porcelain p-6 shadow-card transition hover:bg-white hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-2xl bg-white text-turco shadow-sm ring-1 ring-navy/5 transition group-hover:bg-turco group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <span className="text-sm font-black text-navy/25">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-8 text-lg font-black leading-snug text-navy">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-navy/58">{step.text}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
