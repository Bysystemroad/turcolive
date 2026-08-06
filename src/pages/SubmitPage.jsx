import { motion } from 'framer-motion';
import { CheckCircle2, ImagePlus, Info, RefreshCw, UploadCloud, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cities, genderPreferences, homeTypes, roomTypes, targetAudiences } from '../data/options.js';
import { fadeUp, stagger } from '../motion.js';

const initialForm = {
  fullName: '',
  title: '',
  city: '',
  district: '',
  rent: '',
  deposit: '',
  roomType: '',
  homeType: '',
  targetAudience: '',
  genderPreference: '',
  peopleCount: '',
  description: '',
  contact: '',
  phoneNumber: '',
  captchaToken: '',
  imageFiles: [],
};

const requiredMessages = {
  fullName: 'Ad soyad alanı zorunludur.',
  title: 'İlan başlığı alanı zorunludur.',
  city: 'Şehir seçmelisiniz.',
  district: 'Adres alanı zorunludur.',
  rent: 'Aylık kira alanı zorunludur.',
  deposit: 'Depozito alanı zorunludur.',
  roomType: 'Oda tipi seçmelisiniz.',
  homeType: 'Ev tipi seçmelisiniz.',
  targetAudience: 'Kimler için alanını seçmelisiniz.',
  genderPreference: 'Cinsiyet tercihi seçimi zorunludur.',
  peopleCount: 'Kaç kişi yaşıyor alanı zorunludur.',
  description: 'Açıklama alanı zorunludur.',
  contact: 'İletişim bilgisi alanı zorunludur.',
  phoneNumber: 'Telefon / WhatsApp numarası zorunludur.',
  imageFiles: 'En az 4 fotoğraf yüklemelisiniz.',
  captchaToken: 'Güvenlik doğrulaması zorunludur.',
};

const maxImageSizeBytes = 8 * 1024 * 1024;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

function useObjectUrls(files) {
  const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [urls]);

  return urls;
}

function validateForm(form) {
  const nextErrors = {};

  Object.entries(requiredMessages).forEach(([field, message]) => {
    if (field === 'imageFiles') {
      if (form.imageFiles.length < 4) nextErrors.imageFiles = message;
      return;
    }

    if (!String(form[field] || '').trim()) {
      nextErrors[field] = message;
    }
  });

  return nextErrors;
}

function getFileExtension(fileName) {
  return String(fileName || '').split('.').pop()?.toLowerCase() || '';
}

function getImageValidationError(file) {
  const extension = getFileExtension(file.name);

  if (!allowedImageTypes.includes(file.type) || !allowedImageExtensions.includes(extension)) {
    return 'Sadece JPG, PNG veya WebP formatında fotoğraf yükleyebilirsiniz.';
  }

  if (file.size > maxImageSizeBytes) {
    return 'Her fotoğraf en fazla 8 MB olabilir.';
  }

  return '';
}

function filterValidImageFiles(files) {
  const validFiles = [];

  for (const file of files) {
    const error = getImageValidationError(file);
    if (error) return { validFiles, error };
    validFiles.push(file);
  }

  return { validFiles, error: '' };
}

export default function SubmitPage({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const imagePreviews = useObjectUrls(form.imageFiles);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitError('');
    setSuccessMessage('');
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const updateImageErrors = (nextFiles) => {
    setErrors((current) => {
      const next = { ...current };
      if (nextFiles.length < 4) {
        next.imageFiles = requiredMessages.imageFiles;
      } else {
        delete next.imageFiles;
      }
      return next;
    });
  };

  const addImageFiles = (files) => {
    if (files.length === 0) return;
    const { validFiles, error } = filterValidImageFiles(files);
    if (error) {
      setErrors((current) => ({ ...current, imageFiles: error }));
      return;
    }
    setSubmitError('');
    setSuccessMessage('');
    setForm((current) => {
      const nextFiles = [...current.imageFiles, ...validFiles];
      updateImageErrors(nextFiles);
      return { ...current, imageFiles: nextFiles };
    });
  };

  const removeImageFile = (index) => {
    setSubmitError('');
    setSuccessMessage('');
    setForm((current) => {
      const nextFiles = current.imageFiles.filter((_, fileIndex) => fileIndex !== index);
      updateImageErrors(nextFiles);
      return { ...current, imageFiles: nextFiles };
    });
  };

  const replaceImageFile = (index, file) => {
    if (!file) return;
    const validationError = getImageValidationError(file);
    if (validationError) {
      setErrors((current) => ({ ...current, imageFiles: validationError }));
      return;
    }
    setSubmitError('');
    setSuccessMessage('');
    setForm((current) => {
      const nextFiles = current.imageFiles.map((currentFile, fileIndex) => (fileIndex === index ? file : currentFile));
      updateImageErrors(nextFiles);
      return { ...current, imageFiles: nextFiles };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    const invalidImage = form.imageFiles.map(getImageValidationError).find(Boolean);
    if (invalidImage) nextErrors.imageFiles = invalidImage;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    try {
      await onSubmit({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        fullName: form.fullName.trim(),
        title: form.title.trim(),
        city: form.city,
        district: form.district.trim(),
        rent: form.rent,
        deposit: form.deposit,
        roomType: form.roomType,
        homeType: form.homeType,
        targetAudience: form.targetAudience,
        genderPreference: form.genderPreference,
        peopleCount: form.peopleCount,
        description: form.description.trim(),
        contact: form.contact.trim(),
        phoneNumber: form.phoneNumber.trim(),
        captchaToken: form.captchaToken,
        imageFiles: form.imageFiles,
      });
      setForm(initialForm);
      setSuccessMessage('İlanınız gönderildi. Onaylandıktan sonra yayınlanacaktır.');
    } catch (error) {
      setSubmitError(error.message || 'İlan şu anda kaydedilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field) => `field ${errors[field] ? 'border-turco ring-2 ring-turco/20' : ''}`;

  return (
    <section className="soft-grid relative overflow-hidden bg-porcelain py-14 sm:py-20">
      <div className="pointer-events-none absolute -left-28 top-24 h-80 w-80 rounded-full bg-turco/10 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.aside
            className="brand-gradient rounded-[2.5rem] p-8 text-white shadow-lift lg:sticky lg:top-28 lg:h-fit"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65 }}
          >
            <motion.img
              className="h-20 w-20 rounded-3xl bg-white object-contain p-1 shadow-card"
              src="/brand/turcolive-logo-cropped.png"
              alt="TurcoLive logosu"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-coral">İlan Ver</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">Evini veya odanı dakikalar içinde paylaş.</h1>
            <div className="mt-8 space-y-4 text-sm leading-6 text-white/78">
              {[
                'İlan sahipleriyle tek tıkla iletişim kur.',
                'Fotoğraflarını yükle, ilanını dakikalar içinde paylaş.',
                'İlanlar kontrol edilerek yayına alınır.',
              ].map((text) => (
                <p key={text} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-coral" size={20} />
                  {text}
                </p>
              ))}
            </div>
          </motion.aside>

          <motion.form
            onSubmit={handleSubmit}
            noValidate
            className="premium-surface rounded-[2.5rem] border border-white/80 p-5 ring-1 ring-navy/5 sm:p-8"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div className="grid gap-5 sm:grid-cols-2" variants={stagger}>
              <Field label="Ad Soyad" error={errors.fullName} className="sm:col-span-2">
                <input
                  className={fieldClass('fullName')}
                  required
                  placeholder="Örn: Canberk Saka"
                  value={form.fullName}
                  onChange={(event) => update('fullName', event.target.value)}
                />
              </Field>

              <Field label="İlan başlığı" error={errors.title} className="sm:col-span-2">
                <input className={fieldClass('title')} required value={form.title} onChange={(event) => update('title', event.target.value)} />
              </Field>

              <Field label="Şehir" error={errors.city}>
                <select className={fieldClass('city')} required value={form.city} onChange={(event) => update('city', event.target.value)}>
                  <option value="">Seç</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Adres" error={errors.district}>
                <input className={fieldClass('district')} required value={form.district} onChange={(event) => update('district', event.target.value)} />
              </Field>

              <Field label="Aylık kira" error={errors.rent}>
                <EuroInput required error={errors.rent} value={form.rent} onChange={(value) => update('rent', value)} />
              </Field>

              <Field label="Depozito" error={errors.deposit}>
                <EuroInput required error={errors.deposit} value={form.deposit} onChange={(value) => update('deposit', value)} />
              </Field>

              <Field label="Oda tipi" error={errors.roomType}>
                <select className={fieldClass('roomType')} required value={form.roomType} onChange={(event) => update('roomType', event.target.value)}>
                  <option value="">Seç</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Ev tipi" error={errors.homeType}>
                <select className={fieldClass('homeType')} required value={form.homeType} onChange={(event) => update('homeType', event.target.value)}>
                  <option value="">Seç</option>
                  {homeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Kimler için?" error={errors.targetAudience}>
                <select className={fieldClass('targetAudience')} required value={form.targetAudience} onChange={(event) => update('targetAudience', event.target.value)}>
                  <option value="">Seç</option>
                  {targetAudiences.map((audience) => (
                    <option key={audience} value={audience}>
                      {audience}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Cinsiyet Tercihi" error={errors.genderPreference}>
                <select className={fieldClass('genderPreference')} required value={form.genderPreference} onChange={(event) => update('genderPreference', event.target.value)}>
                  <option value="">Seç</option>
                  {genderPreferences.map((preference) => (
                    <option key={preference} value={preference}>
                      {preference}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Kaç kişi yaşıyor" error={errors.peopleCount}>
                <input className={fieldClass('peopleCount')} required min="0" type="number" value={form.peopleCount} onChange={(event) => update('peopleCount', event.target.value)} />
              </Field>

              <Field label="Telefon / WhatsApp Numarası" error={errors.phoneNumber}>
                <input
                  className={fieldClass('phoneNumber')}
                  required
                  placeholder="Örn: +39 333 123 4567"
                  value={form.phoneNumber}
                  onChange={(event) => update('phoneNumber', event.target.value)}
                />
              </Field>

              <Field label="Açıklama" error={errors.description} className="sm:col-span-2">
                <textarea className={`${fieldClass('description')} min-h-36 resize-y`} required value={form.description} onChange={(event) => update('description', event.target.value)} />
              </Field>

              <Field label="İletişim bilgisi" error={errors.contact} className="sm:col-span-2">
                <input
                  className={fieldClass('contact')}
                  required
                  placeholder="Telefon, e-posta veya sosyal medya hesabı"
                  value={form.contact}
                  onChange={(event) => update('contact', event.target.value)}
                />
              </Field>

              <motion.div className="sm:col-span-2" variants={fadeUp}>
                <UploadField
                  label="Fotoğraf yükleme"
                  accept="image/jpeg,image/png,image/webp"
                  icon={ImagePlus}
                  previews={imagePreviews}
                  fileCount={form.imageFiles.length}
                  error={errors.imageFiles}
                  requiredText="Zorunlu"
                  onAdd={addImageFiles}
                  onRemove={removeImageFile}
                  onReplace={replaceImageFile}
                />
              </motion.div>

              <motion.div className="sm:col-span-2" variants={fadeUp}>
                <CaptchaField
                  error={errors.captchaToken}
                  siteKey={turnstileSiteKey}
                  onVerify={(token) => update('captchaToken', token)}
                />
              </motion.div>
            </motion.div>

            {submitError && (
              <motion.p
                className="mt-5 rounded-2xl bg-blush px-4 py-3 text-sm font-extrabold text-turco ring-1 ring-turco/10"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {submitError}
              </motion.p>
            )}

            {successMessage && (
              <motion.p
                className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {successMessage}
              </motion.p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-navy/55">
                İlanlar kısa bir kontrol sürecinden sonra yayına alınır.
              </p>
              <motion.button
                type="submit"
                disabled={submitting}
                className="premium-button disabled:cursor-not-allowed disabled:opacity-60"
                whileHover={{ scale: submitting ? 1 : 1.04, y: submitting ? 0 : -3 }}
                whileTap={{ scale: submitting ? 1 : 0.97 }}
              >
                <UploadCloud size={19} />
                {submitting ? 'Fotoğraflar yükleniyor' : 'İlanı Gönder'}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children, error, className = '' }) {
  return (
    <motion.label className={`grid gap-2 ${className}`} variants={fadeUp}>
      <span className="label">
        {label} <span className="text-turco">*</span>
      </span>
      {children}
      {error && <p className="text-sm font-extrabold text-turco">{error}</p>}
    </motion.label>
  );
}

function EuroInput({ value, onChange, required = false, error = '' }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm font-black text-turco">€</span>
      <input
        className={`field ${error ? 'border-turco ring-2 ring-turco/20' : ''}`}
        style={{ paddingLeft: '3rem' }}
        required={required}
        min="0"
        inputMode="numeric"
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function CaptchaField({ siteKey, onVerify, error = '' }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onVerifyRef = useRef(onVerify);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    if (!siteKey) return undefined;

    let cancelled = false;
    let intervalId;

    const renderTurnstile = () => {
      if (cancelled || !window.turnstile || !containerRef.current || widgetIdRef.current !== null) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerifyRef.current(token),
        'expired-callback': () => onVerifyRef.current(''),
        'error-callback': () => onVerifyRef.current(''),
      });
    };

    if (!window.turnstile && !document.querySelector('script[data-turnstile-script]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.turnstileScript = 'true';
      script.onload = renderTurnstile;
      document.head.appendChild(script);
    }

    renderTurnstile();
    intervalId = window.setInterval(renderTurnstile, 250);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  return (
    <div className={`grid gap-2 rounded-[1.75rem] border bg-white/72 p-4 ${error ? 'border-turco ring-2 ring-turco/20' : 'border-navy/10'}`}>
      <span className="label">
        Güvenlik doğrulaması <span className="text-turco">*</span>
      </span>
      {siteKey ? (
        <div ref={containerRef} className="min-h-[65px]" />
      ) : (
        <p className="rounded-2xl bg-blush px-4 py-3 text-sm font-extrabold text-turco ring-1 ring-turco/10">
          CAPTCHA site anahtarı yapılandırılmalıdır.
        </p>
      )}
      {error && <p className="text-sm font-extrabold text-turco">{error}</p>}
    </div>
  );
}

function UploadField({ label, accept, icon: Icon, onAdd, onRemove, onReplace, previews, fileCount, error = '', requiredText = '' }) {
  const replaceInputRefs = useRef([]);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="label">
          {label} <span className="text-turco">*</span>
        </span>
        <div className="flex items-center gap-2">
          {fileCount > 0 && <span className="rounded-full bg-porcelain px-3 py-1 text-xs font-black text-navy">{fileCount} fotoğraf</span>}
          {requiredText && <span className="rounded-full bg-blush px-3 py-1 text-xs font-black text-turco ring-1 ring-turco/10">{requiredText}</span>}
        </div>
      </div>
      <p className="inline-flex items-center gap-2 text-sm font-extrabold text-navy/68">
        <Info size={16} className="text-turco" />
        En az 4 fotoğraf yüklemelisiniz.
      </p>
      <div
        className={`grid min-h-72 place-items-center overflow-hidden rounded-[1.75rem] border border-dashed bg-white/72 p-4 text-center transition hover:border-turco/60 hover:bg-white ${
          error ? 'border-turco ring-2 ring-turco/20' : 'border-navy/20'
        }`}
      >
        {previews.length > 0 ? (
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview, index) => (
              <motion.div
                key={preview}
                className="group/photo relative overflow-hidden rounded-2xl bg-porcelain shadow-sm ring-1 ring-navy/10"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                <img
                  className="aspect-[4/3] w-full object-cover transition duration-300 group-hover/photo:scale-105"
                  src={preview}
                  alt={`Seçilen fotoğraf ${index + 1}`}
                />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-navy/55 to-transparent p-3">
                  <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-black text-navy shadow-sm backdrop-blur-xl">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/94 text-turco shadow-sm ring-1 ring-turco/10 transition hover:bg-turco hover:text-white"
                    aria-label={`${index + 1}. fotoğrafı kaldır`}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-navy/58 to-transparent p-3">
                  <button
                    type="button"
                    onClick={() => replaceInputRefs.current[index]?.click()}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white/94 px-4 py-2 text-xs font-black text-navy shadow-sm ring-1 ring-navy/10 backdrop-blur-xl transition hover:bg-blush hover:text-turco"
                  >
                    <RefreshCw size={15} />
                    Değiştir
                  </button>
                  <input
                    ref={(element) => {
                      replaceInputRefs.current[index] = element;
                    }}
                    className="sr-only"
                    type="file"
                    accept={accept}
                    onChange={(event) => {
                      onReplace(index, event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                </div>
              </motion.div>
            ))}
            <label className="group grid aspect-[4/3] cursor-pointer place-items-center rounded-2xl border border-dashed border-navy/20 bg-white/82 p-4 text-center transition hover:border-turco/60 hover:bg-white">
              <span className="flex flex-col items-center gap-3 text-sm font-black text-navy/58">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-turco ring-1 ring-turco/10 transition group-hover:scale-105">
                  <Icon size={22} />
                </span>
                Daha fazla fotoğraf ekle
              </span>
              <input
                className="sr-only"
                type="file"
                accept={accept}
                multiple
                onChange={(event) => {
                  onAdd(Array.from(event.target.files || []));
                  event.target.value = '';
                }}
              />
            </label>
          </div>
        ) : (
          <label className="group flex cursor-pointer flex-col items-center gap-3 p-6 text-sm font-bold text-navy/55">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-turco shadow-sm ring-1 ring-turco/10 transition group-hover:scale-105">
              <Icon size={24} />
            </span>
            Fotoğrafları seç
            <input
              className="sr-only"
              type="file"
              accept={accept}
              multiple
              onChange={(event) => {
                onAdd(Array.from(event.target.files || []));
                event.target.value = '';
              }}
            />
          </label>
        )}
      </div>
      {error && <p className="text-sm font-extrabold text-turco">{error}</p>}
    </div>
  );
}
