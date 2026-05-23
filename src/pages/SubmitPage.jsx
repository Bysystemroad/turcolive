import { motion } from 'framer-motion';
import { CheckCircle2, ImagePlus, Info, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  imageFiles: 'En az 4 fotoğraf yüklemelisiniz.',
};

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

export default function SubmitPage({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const imagePreviews = useObjectUrls(form.imageFiles);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    const submittedImageUrls = form.imageFiles.map((file) => URL.createObjectURL(file));

    onSubmit({
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
      imageFileNames: form.imageFiles.map((file) => file.name),
      imageUrls: submittedImageUrls,
    });

    setSubmitting(false);
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
            <h1 className="mt-4 text-4xl font-black tracking-tight">Evin veya odan için güven veren bir ilan oluştur.</h1>
            <div className="mt-8 space-y-4 text-sm leading-6 text-white/78">
              {[
                'TurcoLive ödeme veya rezervasyon platformu değildir.',
                'İlanlara istediğin kadar fotoğraf ekleyebilirsin.',
                'Kimler için uygun olduğunu açıkça belirtebilirsin.',
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
                  accept="image/*"
                  icon={ImagePlus}
                  previews={imagePreviews}
                  fileCount={form.imageFiles.length}
                  error={errors.imageFiles}
                  requiredText="Zorunlu"
                  onChange={(files) => update('imageFiles', [...form.imageFiles, ...files])}
                />
              </motion.div>
            </motion.div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-navy/55">
                Gönderilen metin bilgileri tarayıcıda saklanır; fotoğraflar sayfa yenilenince kalıcı olmaz.
              </p>
              <motion.button
                type="submit"
                disabled={submitting}
                className="premium-button disabled:cursor-not-allowed disabled:opacity-60"
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <UploadCloud size={19} />
                {submitting ? 'Kaydediliyor' : 'İlanı Gönder'}
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

function UploadField({ label, accept, icon: Icon, onChange, previews, fileCount, error = '', requiredText = '' }) {
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
      <label
        className={`group grid min-h-72 cursor-pointer place-items-center overflow-hidden rounded-[1.75rem] border border-dashed bg-white/72 p-4 text-center transition hover:border-turco/60 hover:bg-white ${
          error ? 'border-turco ring-2 ring-turco/20' : 'border-navy/20'
        }`}
      >
        {previews.length > 0 ? (
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview, index) => (
              <motion.img
                key={preview}
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm ring-1 ring-navy/10"
                src={preview}
                alt={`Seçilen fotoğraf ${index + 1}`}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
              />
            ))}
          </div>
        ) : (
          <span className="flex flex-col items-center gap-3 p-6 text-sm font-bold text-navy/55">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-turco shadow-sm ring-1 ring-turco/10 transition group-hover:scale-105">
              <Icon size={24} />
            </span>
            Fotoğrafları seç
          </span>
        )}
        <input
          className="sr-only"
          type="file"
          accept={accept}
          multiple
          required
          onChange={(event) => {
            onChange(Array.from(event.target.files || []));
            event.target.value = '';
          }}
        />
      </label>
      {error && <p className="text-sm font-extrabold text-turco">{error}</p>}
    </div>
  );
}
