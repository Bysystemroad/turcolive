export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://turcolive.vercel.app').replace(/\/$/, '');

export const defaultSeo = {
  title: 'TurcoLive | İtalya’da Türk Ev Arkadaşı ve Oda İlanları',
  description:
    'İtalya’da yaşayan Türkler için ev, oda ve ev arkadaşı ilan platformu. Roma, Milano, Bologna ve diğer şehirlerde Türk ev arkadaşı bul.',
  keywords: [
    'İtalya Türk ev arkadaşı',
    'Roma Türk oda ilanları',
    'Milano Türk ev arkadaşı',
    'Bologna Türk öğrenci evi',
    'İtalya Türk oda kiralama',
    'Türk ev arkadaşı bul',
  ],
  path: '/',
};

export const citySeoPages = {
  '/roma-turk-oda-ilanlari': {
    pageId: 'roma-turk-oda-ilanlari',
    city: 'Roma',
    title: 'Roma Türk Oda İlanları | TurcoLive',
    description:
      'Roma’da yaşayan Türkler için oda ve ev arkadaşı ilanlarını keşfet. TurcoLive ile Roma’da Türk ev arkadaşı ve oda bul.',
    heading: 'Roma Türk oda ilanları',
    intro: 'Roma’da yaşayan Türkler için oda, ev ve ev arkadaşı ilanlarını tek bir topluluk odaklı platformda keşfet.',
    path: '/roma-turk-oda-ilanlari',
  },
  '/milano-turk-ev-arkadasi': {
    pageId: 'milano-turk-ev-arkadasi',
    city: 'Milano',
    title: 'Milano Türk Ev Arkadaşı | TurcoLive',
    description:
      'Milano’da Türk ev arkadaşı, oda ve paylaşımlı ev ilanlarını keşfet. İtalya’daki Türk topluluğu için güvenilir ilan platformu.',
    heading: 'Milano Türk ev arkadaşı ilanları',
    intro: 'Milano’da okuyan veya çalışan Türkler için ev arkadaşı ve oda ilanlarını daha güvenli şekilde incele.',
    path: '/milano-turk-ev-arkadasi',
  },
  '/bologna-turk-ogrenci-evi': {
    pageId: 'bologna-turk-ogrenci-evi',
    city: 'Bologna',
    title: 'Bologna Türk Öğrenci Evi | TurcoLive',
    description:
      'Bologna’da Türk öğrenciler için oda, öğrenci evi ve ev arkadaşı ilanları. TurcoLive ile Türk topluluğuna uygun ev paylaşımı bul.',
    heading: 'Bologna Türk öğrenci evi ilanları',
    intro: 'Bologna’da Türk öğrenciler için oda, stüdyo ve paylaşımlı ev seçeneklerini topluluk odaklı ilanlarla keşfet.',
    path: '/bologna-turk-ogrenci-evi',
  },
  '/torino-turk-oda-ilanlari': {
    pageId: 'torino-turk-oda-ilanlari',
    city: 'Torino',
    title: 'Torino Türk Oda İlanları | TurcoLive',
    description:
      'Torino’da Türkler için oda ve ev arkadaşı ilanlarını incele. TurcoLive, İtalya’daki Türkler için modern ev paylaşım platformudur.',
    heading: 'Torino Türk oda ilanları',
    intro: 'Torino’da yaşayan Türkler için uygun oda ve ev arkadaşı ilanlarını sade, güvenilir ve modern bir deneyimle bul.',
    path: '/torino-turk-oda-ilanlari',
  },
  '/padova-turk-ev-arkadasi': {
    pageId: 'padova-turk-ev-arkadasi',
    city: 'Padova',
    title: 'Padova Türk Ev Arkadaşı | TurcoLive',
    description:
      'Padova’da Türk ev arkadaşı ve oda ilanları. Öğrenciler ve çalışanlar için topluluk odaklı ev paylaşım platformu.',
    heading: 'Padova Türk ev arkadaşı ilanları',
    intro: 'Padova’da Türk ev arkadaşı arayanlar için oda ve ev ilanlarını topluluk hissiyle bir araya getiriyoruz.',
    path: '/padova-turk-ev-arkadasi',
  },
  '/firenze-turk-oda-ilanlari': {
    pageId: 'firenze-turk-oda-ilanlari',
    city: 'Firenze',
    title: 'Firenze Türk Oda İlanları | TurcoLive',
    description:
      'Firenze’de yaşayan Türkler için oda ve ev arkadaşı ilanları. TurcoLive ile Firenze’de Türk topluluğuna uygun ev bul.',
    heading: 'Firenze Türk oda ilanları',
    intro: 'Firenze’de Türklerle aynı evi paylaşmak isteyenler için oda ve ev arkadaşı ilanlarını keşfet.',
    path: '/firenze-turk-oda-ilanlari',
  },
  '/napoli-turk-oda-ilanlari': {
    pageId: 'napoli-turk-oda-ilanlari',
    city: 'Napoli',
    title: 'Napoli Türk Oda İlanları | TurcoLive',
    description:
      'Napoli’de yaşayan Türkler için oda, ev ve ev arkadaşı ilanlarını keşfet. TurcoLive ile Napoli’de güvenilir ev paylaşımı bul.',
    heading: 'Napoli Türk oda ilanları',
    intro: 'Napoli’de yaşayan Türkler için oda ve ev arkadaşı ilanlarını topluluk odaklı bir deneyimle keşfet.',
    path: '/napoli-turk-oda-ilanlari',
  },
  '/venezia-turk-ev-arkadasi': {
    pageId: 'venezia-turk-ev-arkadasi',
    city: 'Venezia',
    title: 'Venezia Türk Ev Arkadaşı | TurcoLive',
    description:
      'Venezia’da Türk ev arkadaşı ve oda ilanları. TurcoLive ile İtalya’daki Türk topluluğuna uygun ev paylaşımı bul.',
    heading: 'Venezia Türk ev arkadaşı ilanları',
    intro: 'Venezia’da Türk ev arkadaşı arayanlar için oda ve ev ilanlarını sade ve güvenilir şekilde incele.',
    path: '/venezia-turk-ev-arkadasi',
  },
};

export const citySeoById = Object.values(citySeoPages).reduce((acc, page) => {
  acc[page.pageId] = page;
  return acc;
}, {});

export const staticSeo = {
  hakkimizda: {
    title: 'Hakkımızda | TurcoLive',
    description: 'TurcoLive’ın İtalya’daki Türkler için ev ve oda paylaşımını nasıl kolaylaştırdığını keşfet.',
    path: '/hakkimizda',
  },
  'gizlilik-politikasi': {
    title: 'Gizlilik Politikası | TurcoLive',
    description: 'TurcoLive gizlilik politikası ve kişisel veri yaklaşımı hakkında bilgi alın.',
    path: '/gizlilik-politikasi',
  },
  'kullanim-sartlari': {
    title: 'Kullanım Şartları | TurcoLive',
    description: 'TurcoLive kullanım şartları, ilan verme ve platform kuralları.',
    path: '/kullanim-sartlari',
  },
  iletisim: {
    title: 'İletişim | TurcoLive',
    description: 'TurcoLive ile iletişime geçin ve İtalya’daki Türk ev paylaşımı topluluğu hakkında bilgi alın.',
    path: '/iletisim',
  },
};

export function getAbsoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
