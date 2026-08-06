import { Pencil, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cities, genderPreferences, homeTypes, roomTypes, targetAudiences } from '../data/options.js';
import { deleteOwnListing, fetchMyListings, updateOwnListing } from '../services/listings.js';

const statusLabels = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  spam: 'Spam',
};

export default function MyListingsPage({ user, onNavigate }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadListings = async () => {
    setLoading(true);
    try {
      setListings(await fetchMyListings());
      setMessage('');
    } catch (error) {
      setMessage(error.message || 'İlanlarınız yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadListings();
  }, [user]);

  const handleDelete = async (listingId) => {
    if (!window.confirm('Bu ilanı ve fotoğraflarını silmek istediğinize emin misiniz?')) return;
    try {
      await deleteOwnListing(listingId);
      setListings((current) => current.filter((listing) => listing.id !== listingId));
    } catch (error) {
      setMessage(error.message || 'İlan silinemedi.');
    }
  };

  const startEdit = (listing) => {
    setEditingId(listing.id);
    setMessage('');
    setEditForm({
      fullName: listing.fullName || '',
      title: listing.title || '',
      city: listing.city || '',
      district: listing.district || '',
      rent: listing.rent || '',
      deposit: listing.deposit || '',
      roomType: listing.roomType || '',
      homeType: listing.homeType || '',
      targetAudience: listing.targetAudience || '',
      genderPreference: listing.genderPreference || '',
      peopleCount: listing.peopleCount || '',
      description: listing.description || '',
      contact: listing.contact || '',
      phoneNumber: listing.phoneNumber || '',
    });
  };

  const updateEditForm = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const requiredFields = [
      'fullName',
      'title',
      'city',
      'district',
      'rent',
      'deposit',
      'roomType',
      'homeType',
      'targetAudience',
      'genderPreference',
      'peopleCount',
      'description',
      'contact',
      'phoneNumber',
    ];

    if (requiredFields.some((field) => !String(editForm[field] || '').trim())) {
      setMessage('Tüm zorunlu alanları doldurmalısınız.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const updatedListing = await updateOwnListing(editingId, editForm);
      setListings((current) => current.map((listing) => (listing.id === editingId ? updatedListing : listing)));
      setEditingId('');
      setEditForm({});
      setMessage('İlanınız güncellendi ve yeniden onay sürecine alındı.');
    } catch (error) {
      setMessage(error.message || 'İlan güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <section className="bg-porcelain px-4 py-20 text-center">
        <p className="text-lg font-black text-navy">İlanlarınızı görmek için giriş yapmalısınız.</p>
        <button className="premium-button mt-6" onClick={() => onNavigate('giris')}>Giriş Yap</button>
      </section>
    );
  }

  return (
    <section className="soft-grid bg-porcelain px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-turco">İlanlarım</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-navy">Paylaştığınız ilanlar</h1>
        <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-navy/60">
          Onaylı bir ilanı düzenlemek isterseniz ilan yeniden kontrol sürecine alınmalıdır. Şimdilik düzenleme talepleri için ilanı silip yeniden gönderebilirsiniz.
        </p>
        {message && <div className="mt-6 rounded-2xl bg-blush px-4 py-3 text-sm font-extrabold text-turco">{message}</div>}
        <div className="mt-8 grid gap-4">
          {loading ? (
            <div className="premium-surface rounded-[2rem] p-6 text-center font-extrabold text-navy/60">İlanlar yükleniyor.</div>
          ) : listings.length === 0 ? (
            <div className="premium-surface rounded-[2rem] p-6 text-center font-extrabold text-navy/60">Henüz ilanınız yok.</div>
          ) : (
            listings.map((listing) => {
              const isEditing = editingId === listing.id;
              return (
              <article key={listing.id} className="premium-surface grid gap-4 rounded-[2rem] border border-white/80 p-4 shadow-card sm:grid-cols-[8rem_1fr_auto] sm:items-center">
                <div className="h-28 overflow-hidden rounded-2xl bg-porcelain">
                  {listing.imageUrls?.[0] ? <img src={listing.imageUrls[0]} alt={listing.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className={isEditing ? 'sm:col-span-2' : ''}>
                  {isEditing ? (
                    <EditListingForm form={editForm} onChange={updateEditForm} />
                  ) : (
                    <>
                      <h2 className="text-xl font-black text-navy">{listing.title}</h2>
                      <p className="mt-1 text-sm font-semibold text-navy/60">{listing.city}, {listing.district}</p>
                      <span className="mt-3 inline-flex rounded-full bg-blush px-3 py-1 text-xs font-black text-turco">{statusLabels[listing.status] || listing.status}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {isEditing ? (
                    <>
                      <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-black text-white ring-1 ring-navy/10 disabled:opacity-60">
                        <Save size={16} />
                        {saving ? 'Kaydediliyor' : 'Kaydet'}
                      </button>
                      <button type="button" onClick={() => setEditingId('')} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-navy ring-1 ring-navy/10">
                        <X size={16} />
                        Vazgeç
                      </button>
                    </>
                  ) : (
                    <>
                      {['pending', 'approved'].includes(listing.status || 'pending') && (
                        <button type="button" onClick={() => startEdit(listing)} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-navy ring-1 ring-navy/10">
                          <Pencil size={16} />
                          Düzenle
                        </button>
                      )}
                      <button type="button" onClick={() => handleDelete(listing.id)} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-turco ring-1 ring-turco/10">
                        <Trash2 size={16} />
                        Sil
                      </button>
                    </>
                  )}
                </div>
              </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function EditListingForm({ form, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <input className="field" value={form.fullName} onChange={(event) => onChange('fullName', event.target.value)} placeholder="Ad Soyad" />
      <input className="field" value={form.title} onChange={(event) => onChange('title', event.target.value)} placeholder="İlan başlığı" />
      <select className="field" value={form.city} onChange={(event) => onChange('city', event.target.value)}>
        <option value="">Şehir</option>
        {cities.map((city) => <option key={city} value={city}>{city}</option>)}
      </select>
      <input className="field" value={form.district} onChange={(event) => onChange('district', event.target.value)} placeholder="Adres" />
      <input className="field" inputMode="numeric" value={form.rent} onChange={(event) => onChange('rent', event.target.value)} placeholder="Aylık kira" />
      <input className="field" inputMode="numeric" value={form.deposit} onChange={(event) => onChange('deposit', event.target.value)} placeholder="Depozito" />
      <select className="field" value={form.roomType} onChange={(event) => onChange('roomType', event.target.value)}>
        <option value="">Oda tipi</option>
        {roomTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>
      <select className="field" value={form.homeType} onChange={(event) => onChange('homeType', event.target.value)}>
        <option value="">Ev tipi</option>
        {homeTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>
      <select className="field" value={form.targetAudience} onChange={(event) => onChange('targetAudience', event.target.value)}>
        <option value="">Kimler için?</option>
        {targetAudiences.map((audience) => <option key={audience} value={audience}>{audience}</option>)}
      </select>
      <select className="field" value={form.genderPreference} onChange={(event) => onChange('genderPreference', event.target.value)}>
        <option value="">Cinsiyet tercihi</option>
        {genderPreferences.map((preference) => <option key={preference} value={preference}>{preference}</option>)}
      </select>
      <input className="field" inputMode="numeric" value={form.peopleCount} onChange={(event) => onChange('peopleCount', event.target.value)} placeholder="Kaç kişi yaşıyor" />
      <input className="field" value={form.phoneNumber} onChange={(event) => onChange('phoneNumber', event.target.value)} placeholder="Telefon / WhatsApp" />
      <input className="field sm:col-span-2" value={form.contact} onChange={(event) => onChange('contact', event.target.value)} placeholder="İletişim bilgisi" />
      <textarea className="field min-h-28 resize-y sm:col-span-2" value={form.description} onChange={(event) => onChange('description', event.target.value)} placeholder="Açıklama" />
    </div>
  );
}
