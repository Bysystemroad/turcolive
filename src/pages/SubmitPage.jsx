import { CheckCircle2, ImagePlus, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cities, homeTypes, roomTypes, targetAudiences } from '../data/options.js';

const initialForm = {
  title: '',
  city: '',
  district: '',
  rent: '',
  deposit: '',
  roomType: '',
  homeType: '',
  targetAudience: '',
  peopleCount: '',
  description: '',
  contact: '',
  imageFiles: [],
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

export default function SubmitPage({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const imagePreviews = useObjectUrls(form.imageFiles);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === 'imageFiles' && value.length > 0) setImageError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.imageFiles.length === 0) {
      setImageError('İlanın yayınlanabilmesi için en az bir fotoğraf yüklenmelidir.');
      return;
    }

    setSubmitting(true);
    const submittedImageUrls = form.imageFiles.map((file) => URL.createObjectURL(file));

    onSubmit({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      title: form.title,
      city: form.city,
      district: form.district,
      rent: form.rent,
      deposit: form.deposit,
      roomType: form.roomType,
      homeType: form.homeType,
      targetAudience: form.targetAudience,
      peopleCount: form.peopleCount,
      description: form.description,
      contact: form.contact,
      imageFileNames: form.imageFiles.map((file) => file.name),
      imageUrls: submittedImageUrls,
    });

    setSubmitting(false);
  };

  return (
    <section className="bg-porcelain py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="brand-gradient rounded-[2.5rem] p-8 text-white shadow-lift lg:sticky lg:top-28 lg:h-fit">
            <img
              className="h-20 w-20 rounded-3xl bg-white object-contain p-1 shadow-card"
              src="/brand/turcolive-logo-cropped.png"
              alt="TurcoLive logosu"
            />
            <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-coral">İlan Ver</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">Evin veya odan için güven veren bir ilan oluştur.</h1>
            <div className="mt-8 space-y-4 text-sm leading-6 text-white/78">
              <p className="flex gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-coral" size={20} />
                TurcoLive ödeme veya rezervasyon platformu değildir.
              </p>
              <p className="flex gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-coral" size={20} />
                İlanlara istediğin kadar fotoğraf ekleyebilirsin.
              </p>
              <p className="flex gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-coral" size={20} />
                Kimin için uygun olduğunu açıkça belirtebilirsin.
              </p>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-[2.5rem] border border-navy/10 bg-white p-5 shadow-card sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="İlan başlığı" className="sm:col-span-2">
                <input className="field" required value={form.title} onChange={(event) => update('title', event.target.value)} />
              </Field>

              <Field label="Şehir">
                <select className="field" required value={form.city} onChange={(event) => update('city', event.target.value)}>
                  <option value="">Seç</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Adres">
                <input className="field" required value={form.district} onChange={(event) => update('district', event.target.value)} />
              </Field>

              <Field label="Aylık kira">
                <EuroInput required value={form.rent} onChange={(value) => update('rent', value)} />
              </Field>

              <Field label="Depozito">
                <EuroInput required value={form.deposit} onChange={(value) => update('deposit', value)} />
              </Field>

              <Field label="Oda tipi">
                <select className="field" required value={form.roomType} onChange={(event) => update('roomType', event.target.value)}>
                  <option value="">Seç</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Ev tipi">
                <select className="field" required value={form.homeType} onChange={(event) => update('homeType', event.target.value)}>
                  <option value="">Seç</option>
                  {homeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Kimin için">
                <select
                  className="field"
                  required
                  value={form.targetAudience}
                  onChange={(event) => update('targetAudience', event.target.value)}
                >
                  <option value="">Seç</option>
                  {targetAudiences.map((audience) => (
                    <option key={audience} value={audience}>
                      {audience}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Kaç kişi yaşıyor">
                <input
                  className="field"
                  required
                  min="0"
                  type="number"
                  value={form.peopleCount}
                  onChange={(event) => update('peopleCount', event.target.value)}
                />
              </Field>

              <Field label="Açıklama" className="sm:col-span-2">
                <textarea className="field min-h-36 resize-y" required value={form.description} onChange={(event) => update('description', event.target.value)} />
              </Field>

              <Field label="İletişim bilgisi" className="sm:col-span-2">
                <input
                  className="field"
                  required
                  placeholder="Telefon, e-posta veya sosyal medya hesabı"
                  value={form.contact}
                  onChange={(event) => update('contact', event.target.value)}
                />
              </Field>

              <div className="sm:col-span-2">
                <UploadField
                  label="Fotoğraf yükleme"
                  accept="image/*"
                  icon={ImagePlus}
                  previews={imagePreviews}
                  fileCount={form.imageFiles.length}
                  requiredText="Zorunlu"
                  onChange={(files) => update('imageFiles', [...form.imageFiles, ...files])}
                />
              </div>
            </div>

            {imageError && (
              <p className="mt-5 rounded-2xl bg-blush px-4 py-3 text-sm font-extrabold text-turco ring-1 ring-turco/10">{imageError}</p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-navy/55">
                Gönderilen metin bilgileri tarayıcıda saklanır; fotoğraflar sayfa yenilenince kalıcı olmaz.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-turco px-7 py-4 text-sm font-black text-white shadow-card transition hover:-translate-y-0.5 hover:bg-coral disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UploadCloud size={19} />
                {submitting ? 'Kaydediliyor' : 'İlanı Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function EuroInput({ value, onChange, required = false }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm font-black text-turco">€</span>
      <input
        className="field"
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

function UploadField({ label, accept, icon: Icon, onChange, previews, fileCount, requiredText = '' }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="label">{label}</span>
        <div className="flex items-center gap-2">
          {fileCount > 0 && <span className="rounded-full bg-porcelain px-3 py-1 text-xs font-black text-navy">{fileCount} fotoğraf</span>}
          {requiredText && <span className="rounded-full bg-blush px-3 py-1 text-xs font-black text-turco ring-1 ring-turco/10">{requiredText}</span>}
        </div>
      </div>
      <label className="group grid min-h-72 cursor-pointer place-items-center overflow-hidden rounded-[1.75rem] border border-dashed border-navy/20 bg-porcelain p-4 text-center transition hover:border-turco/60 hover:bg-white">
        {previews.length > 0 ? (
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview, index) => (
              <img
                key={preview}
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm ring-1 ring-navy/10"
                src={preview}
                alt={`Seçilen fotoğraf ${index + 1}`}
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
          onChange={(event) => {
            onChange(Array.from(event.target.files || []));
            event.target.value = '';
          }}
        />
      </label>
    </div>
  );
}
