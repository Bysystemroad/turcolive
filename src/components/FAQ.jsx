import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'TurcoLive üzerinden ödeme veya rezervasyon yapılıyor mu?',
    answer:
      'Hayır. TurcoLive bir ödeme ya da rezervasyon platformu değildir. İlanları inceler, ilan sahibiyle doğrudan iletişime geçersin.',
  },
  {
    question: 'TurcoLive kimler için tasarlandı?',
    answer:
      'İtalya’da yaşayan Türk öğrenciler ve çalışanlar için ev, oda ve ev arkadaşı bulmayı kolaylaştıran topluluk odaklı bir platformdur.',
  },
  {
    question: 'İlan vermek ücretli mi?',
    answer:
      'Bu MVP sürümünde ödeme sistemi bulunmaz. Kullanıcılar ilan bilgilerini girerek topluluk içinde paylaşım yapabilir.',
  },
  {
    question: 'Fotoğraflarım kalıcı olarak saklanıyor mu?',
    answer:
      'Şu an fotoğraflar frontend oturumu içinde önizleme olarak gösterilir. Kalıcı fotoğraf depolama daha sonra backend ile eklenecektir.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">SSS</p>
          <h2 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-navy sm:text-5xl">
            Sıkça sorulan sorular
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-navy/62">
            TurcoLive’ın nasıl çalıştığını, ilan paylaşımının kapsamını ve mevcut MVP deneyimini buradan hızlıca inceleyebilirsin.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className="overflow-hidden rounded-[1.75rem] border border-navy/10 bg-porcelain shadow-sm transition hover:shadow-card"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-5 px-6 py-6 text-left sm:px-8"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span className="text-lg font-black text-navy">{item.question}</span>
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-turco shadow-sm ring-1 ring-navy/10 transition ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown size={20} />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-7 text-base leading-7 text-navy/65 sm:px-8">{item.answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
