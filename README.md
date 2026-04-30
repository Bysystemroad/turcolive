# TurcoLive

TurcoLive, İtalya’da yaşayan Türklerin oda, ev ve ev arkadaşı ilanlarını paylaşması için hazırlanmış modern bir frontend MVP projesidir.

## Özellikler

- Türkçe arayüz
- Ana sayfa, ilanlar sayfası, ilan verme formu
- Fotoğraflı ilan paylaşımı
- Birden fazla fotoğraf yükleme ve geçici önizleme
- İlan detay sayfasında galeri görünümü
- Filtreleme alanları: şehir, bütçe, oda tipi, ev tipi
- LocalStorage ile metinsel ilan verisi saklama
- Fotoğrafları kalıcı saklamadan sadece oturum içi object URL ile gösterme
- React ErrorBoundary ile beyaz ekran hatalarına karşı koruma

## Teknolojiler

- React
- Vite
- Tailwind CSS
- lucide-react

## Kurulum

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Not

Bu proje frontend-only MVP’dir. Fotoğraf dosyaları şu an backend’e yüklenmez ve sayfa yenilendiğinde kalıcı olarak saklanmaz. Kalıcı dosya saklama için ileride Supabase Storage, Firebase Storage veya AWS S3 gibi bir servis eklenmelidir.
