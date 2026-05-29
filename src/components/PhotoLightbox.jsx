import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampZoom(value) {
  return clamp(Number(value.toFixed(2)), MIN_ZOOM, MAX_ZOOM);
}

function getTouchDistance(touches) {
  const [first, second] = touches;
  const deltaX = first.clientX - second.clientX;
  const deltaY = first.clientY - second.clientY;
  return Math.hypot(deltaX, deltaY);
}

export default function PhotoLightbox({ images, currentIndex, title = 'İlan fotoğrafı', onChange, onClose }) {
  const [brokenImageUrls, setBrokenImageUrls] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const imageAreaRef = useRef(null);
  const dragStartRef = useRef({ pointerId: null, x: 0, y: 0, panX: 0, panY: 0 });
  const pinchRef = useRef({ distance: 0, zoom: 1 });

  const isOpen = currentIndex !== null && currentIndex !== undefined && images.length > 0;
  const imageSignature = images.join('|');
  const activeIndex = Math.min(Math.max(currentIndex ?? 0, 0), Math.max(images.length - 1, 0));
  const activeImage = images[activeIndex];
  const activeImageBroken = Boolean(brokenImageUrls[activeImage]);
  const zoomPercent = Math.round(zoomLevel * 100);

  const getPanBounds = (zoom = zoomLevel) => {
    const rect = imageAreaRef.current?.getBoundingClientRect();
    if (!rect || zoom <= 1) return { x: 0, y: 0 };
    return {
      x: (rect.width * (zoom - 1)) / 2,
      y: (rect.height * (zoom - 1)) / 2,
    };
  };

  const setClampedPan = (nextPanX, nextPanY, zoom = zoomLevel) => {
    const bounds = getPanBounds(zoom);
    setPanX(clamp(nextPanX, -bounds.x, bounds.x));
    setPanY(clamp(nextPanY, -bounds.y, bounds.y));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
    setIsDragging(false);
    dragStartRef.current = { pointerId: null, x: 0, y: 0, panX: 0, panY: 0 };
    pinchRef.current = { distance: 0, zoom: 1 };
  };

  const updateZoom = (nextZoom) => {
    const clampedZoom = clampZoom(nextZoom);
    setZoomLevel(clampedZoom);
    if (clampedZoom === 1) {
      setPanX(0);
      setPanY(0);
      return;
    }
    setClampedPan(panX, panY, clampedZoom);
  };

  useEffect(() => {
    setBrokenImageUrls({});
  }, [imageSignature]);

  useEffect(() => {
    resetZoom();
  }, [activeImage, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange((activeIndex - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') onChange((activeIndex + 1) % images.length);
      if (event.key === '+' || event.key === '=') updateZoom(zoomLevel + ZOOM_STEP);
      if (event.key === '-') updateZoom(zoomLevel - ZOOM_STEP);
      if (event.key === '0') resetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length, isOpen, onChange, onClose, zoomLevel, panX, panY]);

  const goPrevious = () => onChange((activeIndex - 1 + images.length) % images.length);
  const goNext = () => onChange((activeIndex + 1) % images.length);
  const markImageBroken = (image) => setBrokenImageUrls((current) => ({ ...current, [image]: true }));

  const handleWheel = (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    updateZoom(zoomLevel + direction * ZOOM_STEP);
  };

  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      updateZoom(2);
      return;
    }
    resetZoom();
  };

  const handlePointerDown = (event) => {
    if (zoomLevel <= 1) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX,
      panY,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || zoomLevel <= 1 || dragStartRef.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    setClampedPan(dragStartRef.current.panX + deltaX, dragStartRef.current.panY + deltaY);
  };

  const stopDragging = (event) => {
    if (dragStartRef.current.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    setIsDragging(false);
    dragStartRef.current.pointerId = null;
  };

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      pinchRef.current = {
        distance: getTouchDistance(event.touches),
        zoom: zoomLevel,
      };
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches.length !== 2 || pinchRef.current.distance === 0) return;
    event.preventDefault();
    const nextDistance = getTouchDistance(event.touches);
    const scale = nextDistance / pinchRef.current.distance;
    updateZoom(pinchRef.current.zoom * scale);
  };

  const handleClose = () => {
    resetZoom();
    onClose();
  };

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-black ring-1 ring-white/15">
              {activeIndex + 1} / {images.length}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
                <ZoomButton label="Uzaklaştır" onClick={() => updateZoom(zoomLevel - ZOOM_STEP)}>
                  <Minus size={18} />
                </ZoomButton>
                <span className="min-w-14 px-2 text-center text-xs font-black text-white/82">{zoomPercent}%</span>
                <ZoomButton label="Yakınlaştır" onClick={() => updateZoom(zoomLevel + ZOOM_STEP)}>
                  <Plus size={18} />
                </ZoomButton>
                <ZoomButton label="Yakınlaştırmayı sıfırla" onClick={resetZoom}>
                  <RotateCcw size={17} />
                </ZoomButton>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white hover:text-navy"
                aria-label="Fotoğraf görüntüleyiciyi kapat"
              >
                <X size={22} />
              </button>
            </div>
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

            {activeImageBroken ? (
              <div className="grid h-[55vh] w-full max-w-4xl place-items-center rounded-[1.5rem] bg-white/8 text-center text-white/70 ring-1 ring-white/10">
                <div>
                  <Home className="mx-auto" size={56} />
                  <p className="mt-4 text-sm font-black">Fotoğraf yüklenemedi.</p>
                </div>
              </div>
            ) : (
              <div
                ref={imageAreaRef}
                className={`flex h-[70vh] max-h-[70vh] w-full max-w-6xl touch-none items-center justify-center overflow-hidden rounded-[1.5rem] ${
                  zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
                }`}
                onWheel={handleWheel}
                onDoubleClick={handleDoubleClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDragging}
                onPointerCancel={stopDragging}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
              >
                <img
                  key={activeImage}
                  src={activeImage}
                  alt={`${title} ${activeIndex + 1}`}
                  className="max-h-full max-w-full select-none rounded-[1.5rem] object-contain shadow-lift ring-1 ring-white/10"
                  draggable="false"
                  style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 180ms ease-out',
                  }}
                  onError={() => markImageBroken(activeImage)}
                />
              </div>
            )}

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
                  {brokenImageUrls[image] ? (
                    <span className="grid h-full w-full place-items-center bg-white/8 text-white/60">
                      <Home size={20} />
                    </span>
                  ) : (
                    <img
                      className="h-full w-full object-cover"
                      src={image}
                      alt={`${title} küçük fotoğraf ${index + 1}`}
                      onError={() => markImageBroken(image)}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ZoomButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white hover:text-navy"
      aria-label={label}
    >
      {children}
    </button>
  );
}
