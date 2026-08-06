import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ListingsPage from './pages/ListingsPage.jsx';
import SEO from './components/SEO.jsx';
import { createListing, fetchListings } from './services/listings.js';
import { fetchProfile, getSession, onAuthChange, resendVerificationEmail, signOutUser } from './services/auth.js';
import { citySeoById, citySeoPages, defaultSeo, staticSeo } from './seo.js';

const SubmitPage = lazy(() => import('./pages/SubmitPage.jsx'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const CitySeoPage = lazy(() => import('./pages/CitySeoPage.jsx'));
const StaticPage = lazy(() => import('./pages/StaticPage.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'));
const MyListingsPage = lazy(() => import('./pages/MyListingsPage.jsx'));

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
  'kayit-ol',
  'giris',
  'sifremi-unuttum',
  'sifre-yenile',
  'hesabim',
  'ilanlarim',
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
  '/kayit-ol': 'kayit-ol',
  '/giris': 'giris',
  '/sifremi-unuttum': 'sifremi-unuttum',
  '/sifre-yenile': 'sifre-yenile',
  '/hesabim': 'hesabim',
  '/ilanlarim': 'ilanlarim',
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
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authNotice, setAuthNotice] = useState('');

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

  const refreshAuth = async () => {
    const currentSession = await getSession().catch(() => null);
    setSession(currentSession);
    setProfile(currentSession ? await fetchProfile().catch(() => null) : null);
  };

  useEffect(() => {
    loadSupabaseListings();
    refreshAuth();
    return onAuthChange(async (nextSession) => {
      setSession(nextSession);
      setProfile(nextSession ? await fetchProfile().catch(() => null) : null);
    });
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
    if (nextPage === 'ilan-ver' && !session?.user) {
      setAuthNotice('İlan vermek için giriş yapmalısınız.');
      window.history.pushState(null, '', '/giris');
      setPage('giris');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const nextPath = staticSeo[nextPage]?.path || pathForPage(nextPage);
    window.history.pushState(null, '', nextPath);
    setPage(nextPage);
    setAuthNotice('');

    if (nextPage === 'nasil-calisir') {
      window.setTimeout(() => {
        document.getElementById('nasil-calisir')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setSession(null);
    setProfile(null);
    goTo('anasayfa');
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
      if (!session?.user) {
        return <AuthPage mode="login" notice="İlan vermek için giriş yapmalısınız." onNavigate={goTo} onAuthSuccess={refreshAuth} />;
      }

      if (!session.user.email_confirmed_at) {
        return (
          <section className="bg-porcelain px-4 py-20 text-center">
            <h1 className="text-3xl font-black text-navy">E-posta doğrulaması gerekli</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-6 text-navy/60">İlan verebilmek için e-posta adresinizi doğrulamalısınız.</p>
            <button className="premium-button mt-6" onClick={() => resendVerificationEmail(session.user.email)}>
              Doğrulama E-postasını Tekrar Gönder
            </button>
          </section>
        );
      }

      if (profile?.is_blocked) {
        return <section className="bg-porcelain px-4 py-20 text-center text-lg font-black text-turco">Hesabınız ilan paylaşımına kapatılmıştır.</section>;
      }

      return (
        <SubmitPage
          onSubmit={async (listing) => {
            await createListing(listing);
          }}
        />
      );
    }

    if (page === 'admin') return <AdminPage />;
    if (page === 'kayit-ol') return <AuthPage mode="signup" onNavigate={goTo} onAuthSuccess={refreshAuth} />;
    if (page === 'giris') return <AuthPage mode="login" notice={authNotice} onNavigate={goTo} onAuthSuccess={refreshAuth} />;
    if (page === 'sifremi-unuttum') return <AuthPage mode="forgot" onNavigate={goTo} />;
    if (page === 'sifre-yenile') return <AuthPage mode="reset" onNavigate={goTo} />;
    if (page === 'hesabim') return <AccountPage user={session?.user} profile={profile} onNavigate={goTo} onProfileUpdated={refreshAuth} />;
    if (page === 'ilanlarim') return <MyListingsPage user={session?.user} onNavigate={goTo} />;

    if (staticPages.includes(page)) return <StaticPage pageId={page} />;

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
  }, [page, listings, selectedListing, loadingListings, listingsError, storageMessage, session, profile, authNotice]);

  return (
    <div className="min-h-screen bg-cream text-navy">
      <SEO {...seo} />
      <Header currentPage={page} onNavigate={goTo} user={session?.user} onLogout={handleLogout} />
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

function pathForPage(page) {
  const entry = Object.entries(pathPages).find(([, pageId]) => pageId === page);
  return entry?.[0] || `/#${page}`;
}
