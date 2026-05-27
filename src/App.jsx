import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ListingsPage from './pages/ListingsPage.jsx';
import SEO from './components/SEO.jsx';
import { createListing, fetchListings } from './services/listings.js';
import { citySeoById, citySeoPages, defaultSeo, staticSeo } from './seo.js';

const SubmitPage = lazy(() => import('./pages/SubmitPage.jsx'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const CitySeoPage = lazy(() => import('./pages/CitySeoPage.jsx'));
const StaticPage = lazy(() => import('./pages/StaticPage.jsx'));

const pages = [
  'anasayfa',
  'ilanlar',
  'ilan-ver',
  'nasil-calisir',
  'admin',
  'hakkimizda',
  'gizlilik-politikasi',
  'kullanim-sartlari',
  'iletisim',
];

const staticPages = ['hakkimizda', 'gizlilik-politikasi', 'kullanim-sartlari', 'iletisim'];
const cityPages = Object.values(citySeoPages).map((cityPage) => cityPage.pageId);
const pathPages = {
  '/ilanlar': 'ilanlar',
  '/ilan-ver': 'ilan-ver',
  '/admin': 'admin',
  '/hakkimizda': 'hakkimizda',
  '/gizlilik-politikasi': 'gizlilik-politikasi',
  '/kullanim-sartlari': 'kullanim-sartlari',
  '/iletisim': 'iletisim',
  ...Object.entries(citySeoPages).reduce((acc, [path, cityPage]) => {
    acc[path] = cityPage.pageId;
    return acc;
  }, {}),
};

function getInitialPage() {
  const pathPage = pathPages[window.location.pathname];
  if (pathPage) return pathPage;

  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('ilan/')) return 'ilan-detay';
  return pages.includes(hash) ? hash : 'anasayfa';
}

function getListingIdFromHash() {
  const hash = window.location.hash.replace('#', '');
  return hash.startsWith('ilan/') ? hash.replace('ilan/', '') : '';
}

function getSeoForPage(page, selectedListing) {
  if (citySeoById[page]) return citySeoById[page];
  if (staticSeo[page]) return staticSeo[page];

  if (page === 'ilanlar') {
    return {
      title: 'İtalya Türk Oda ve Ev Arkadaşı İlanları | TurcoLive',
      description: 'İtalya’da Türkler için onaylı oda, ev ve ev arkadaşı ilanlarını keşfet.',
      path: '/ilanlar',
    };
  }

  if (page === 'ilan-ver') {
    return {
      title: 'İlan Ver | TurcoLive',
      description: 'İtalya’da oda, ev veya ev arkadaşı ilanını TurcoLive topluluğuyla paylaş.',
      path: '/ilan-ver',
    };
  }

  if (page === 'ilan-detay' && selectedListing) {
    return {
      title: `${selectedListing.title} | TurcoLive`,
      description: `${selectedListing.city} içinde Türk topluluğuna uygun oda ve ev paylaşımı ilanı. ${selectedListing.roomType || ''} ${selectedListing.homeType || ''}`.trim(),
      path: `/ilan/${selectedListing.id}`,
      type: 'article',
    };
  }

  return defaultSeo;
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const [listings, setListings] = useState([]);
  const [storageMessage, setStorageMessage] = useState('');
  const [listingsError, setListingsError] = useState('');
  const [loadingListings, setLoadingListings] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState(getListingIdFromHash);

  const loadSupabaseListings = async () => {
    setLoadingListings(true);
    setListingsError('');
    try {
      const data = await fetchListings();
      setListings(data);
      setStorageMessage('');
    } catch (error) {
      setListingsError(error.message || 'İlanlar Supabase üzerinden yüklenemedi.');
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    loadSupabaseListings();
  }, []);

  useEffect(() => {
    const handleRoute = () => {
      setSelectedListingId(getListingIdFromHash());
      setPage(getInitialPage());
    };
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    handleRoute();
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  const goTo = (nextPage) => {
    const nextPath = staticSeo[nextPage]?.path || `/#${nextPage}`;
    window.history.pushState(null, '', nextPath);
    setPage(nextPage);

    if (nextPage === 'nasil-calisir') {
      window.setTimeout(() => {
        document.getElementById('nasil-calisir')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openListing = (listingId) => {
    window.history.pushState(null, '', `/#ilan/${listingId}`);
    setSelectedListingId(listingId);
    setPage('ilan-detay');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedListing = listings.find((listing) => listing.id === selectedListingId);
  const seo = getSeoForPage(page, selectedListing);

  const content = useMemo(() => {
    if (page === 'ilanlar') {
      return (
        <ListingsPage
          listings={listings}
          loading={loadingListings}
          error={listingsError}
          onRetry={loadSupabaseListings}
          onNavigate={goTo}
          onOpenListing={openListing}
        />
      );
    }

    if (page === 'ilan-detay') {
      return <ListingDetailPage listing={selectedListing} onBack={() => goTo('ilanlar')} onNavigate={goTo} />;
    }

    if (page === 'ilan-ver') {
      return (
        <SubmitPage
          onSubmit={async (listing) => {
            await createListing(listing);
          }}
        />
      );
    }

    if (page === 'admin') {
      return <AdminPage />;
    }

    if (staticPages.includes(page)) {
      return <StaticPage pageId={page} />;
    }

    if (cityPages.includes(page)) {
      return (
        <CitySeoPage
          cityPage={citySeoById[page]}
          listings={listings}
          loading={loadingListings}
          error={listingsError}
          onRetry={loadSupabaseListings}
          onNavigate={goTo}
          onOpenListing={openListing}
        />
      );
    }

    return <HomePage onNavigate={goTo} />;
  }, [page, listings, selectedListing, loadingListings, listingsError, storageMessage]);

  return (
    <div className="min-h-screen bg-cream text-navy">
      <SEO {...seo} />
      <Header currentPage={page} onNavigate={goTo} />
      {storageMessage && (
        <div className="border-b border-turco/10 bg-blush px-4 py-3 text-center text-sm font-extrabold text-turco">
          {storageMessage}
        </div>
      )}
      <main>
        <Suspense
          fallback={
            <section className="bg-porcelain px-4 py-20 text-center">
              <p className="text-lg font-black text-navy">Sayfa yükleniyor.</p>
            </section>
          }
        >
          {content}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
