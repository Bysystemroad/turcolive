import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect } from 'react';

export default function PhotoLightbox({ images, currentIndex, title = 'İlan fotoğrafı', onChange, onClose }) {
  const isOpen = currentIndex !== null && currentIndex !== undefined && images.length > 0;
  const activeIndex = Math.min(Math.max(currentIndex ?? 0, 0), Math.max(images.length - 1, 0));
  const activeImage = images[activeIndex];

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange((activeIndex - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') onChange((activeIndex + 1) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length, isOpen, onChange, onClose]);

  const goPrevious = () => onChange((activeIndex - 1 + images.length) % images.length);
  const goNext = () => onChange((activeIndex + 1) % images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col bg-midnight/92 px-4 py-4 text-white backdrop-blur-xl sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Fotoğraf görüntüleyici"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-black ring-1 ring-white/15">
              {activeIndex + 1} / {images.length}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white hover:text-navy"
              aria-label="Fotoğraf görüntüleyiciyi kapat"
            >
              <X size={22} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center py-5">
            {images.length > 1 && (
              <button
                type="button"
                onClick={goPrevious}
                className="absolute left-0 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/15 transition hover:bg-white hover:text-navy sm:left-4"
                aria-label="Önceki fotoğraf"
              >
                <ChevronLeft size={26} />
              </button>
            )}

            <motion.img
              key={activeImage}
              src={activeImage}
              alt={`${title} ${activeIndex + 1}`}
              className="max-h-[68vh] max-w-full rounded-[1.5rem] object-contain shadow-lift ring-1 ring-white/10"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-0 z-10 grid h-12 w-12 place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/15 transition hover:bg-white hover:text-navy sm:right-4"
                aria-label="Sonraki fotoğraf"
              >
                <ChevronRight size={26} />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="mx-auto flex max-w-5xl gap-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => onChange(index)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition sm:h-20 sm:w-28 ${
                    activeIndex === index ? 'ring-turco' : 'ring-white/20 hover:ring-white/70'
                  }`}
                  aria-label={`${index + 1}. fotoğrafı aç`}
                >
                  <img className="h-full w-full object-cover" src={image} alt={`${title} küçük fotoğraf ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
