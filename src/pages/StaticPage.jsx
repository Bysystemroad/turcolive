import { motion } from 'framer-motion';
import { fadeUp, stagger } from '../motion.js';

const pageContent = {
  hakkimizda: {
    eyebrow: 'Hakkımızda',
    title: 'TurcoLive, İtalya’daki Türk topluluğu için güvenilir ev paylaşımını kolaylaştırır.',
    body: [
      'TurcoLive; İtalya’da yaşayan Türk öğrenciler ve çalışanlar için oda, ev ve ev arkadaşı ilanlarını daha düzenli, şeffaf ve topluluk odaklı hale getiren bir platformdur.',
      'Platform ödeme veya rezervasyon hizmeti sunmaz. Kullanıcılar ilanları inceler, ilan verir ve ilan sahibiyle doğrudan iletişime geçer.',
    ],
  },
  'gizlilik-politikasi': {
    eyebrow: 'Gizlilik Politikası',
    title: 'Kişisel bilgilerin sade ve sorumlu şekilde işlenmesini önemsiyoruz.',
    body: [
      'TurcoLive, ilan oluşturma ve iletişim kurma amacıyla kullanıcıların paylaştığı bilgileri kullanır.',
      'Fotoğraflar ve ilan bilgileri Supabase altyapısında saklanır. Hassas bilgilerinizi herkese açık açıklama alanlarında paylaşmamanızı öneririz.',
    ],
  },
  'kullanim-sartlari': {
    eyebrow: 'Kullanım Şartları',
    title: 'TurcoLive, ev ve oda paylaşımı için topluluk odaklı bir ilan platformudur.',
    body: [
      'Kullanıcılar doğru, güncel ve yanıltıcı olmayan ilan bilgileri paylaşmaktan sorumludur.',
      'TurcoLive ödeme, rezervasyon veya taraflar arasında sözleşme hizmeti sunmaz. İletişim ve anlaşma süreçleri kullanıcıların kendi sorumluluğundadır.',
    ],
  },
  iletisim: {
    eyebrow: 'İletişim',
    title: 'TurcoLive ile iletişime geç.',
    body: [
      'Platform, iş birliği veya destek talepleri için bizimle iletişime geçebilirsin.',
      'E-posta: info@turcolive.com',
    ],
  },
};

export default function StaticPage({ pageId = 'hakkimizda' }) {
  const content = pageContent[pageId] || pageContent.hakkimizda;

  return (
    <section className="soft-grid min-h-[70vh] bg-porcelain px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        className="premium-surface mx-auto max-w-4xl rounded-[2.5rem] border border-white/80 p-8 shadow-card ring-1 ring-navy/5 sm:p-12"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.p variants={fadeUp} className="text-sm font-black uppercase tracking-[0.2em] text-turco">
          {content.eyebrow}
        </motion.p>
        <motion.h1 variants={fadeUp} className="mt-4 text-4xl font-black tracking-tight text-navy sm:text-5xl">
          {content.title}
        </motion.h1>
        <motion.div variants={stagger} className="mt-8 space-y-5 text-base leading-8 text-navy/68">
          {content.body.map((paragraph) => (
            <motion.p key={paragraph} variants={fadeUp}>
              {paragraph}
            </motion.p>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
