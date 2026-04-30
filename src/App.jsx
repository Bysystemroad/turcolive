import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ListingsPage from './pages/ListingsPage.jsx';
import SubmitPage from './pages/SubmitPage.jsx';
import ListingDetailPage from './pages/ListingDetailPage.jsx';
import { loadListings, saveListings } from './storage.js';

const pages = ['anasayfa', 'ilanlar', 'ilan-ver', 'nasil-calisir'];

function getInitialPage() {
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('ilan/')) return 'ilan-detay';
  return pages.includes(hash) ? hash : 'anasayfa';
}

function getListingIdFromHash() {
  const hash = window.location.hash.replace('#', '');
  return hash.startsWith('ilan/') ? hash.replace('ilan/', '') : '';
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const [listings, setListings] = useState(loadListings);
  const [storageMessage, setStorageMessage] = useState('');
  const [selectedListingId, setSelectedListingId] = useState(getListingIdFromHash);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#ilanlari-temizle') {
        localStorage.removeItem('turcolive_listings');
        setListings([]);
        window.location.hash = 'ilanlar';
        return;
      }
      setSelectedListingId(getListingIdFromHash());
      setPage(getInitialPage());
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const result = saveListings(listings);
    if (!result.ok) {
      setStorageMessage(result.message);
      return;
    }
    setStorageMessage('');
  }, [listings]);

  const goTo = (nextPage) => {
    window.location.hash = nextPage;
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
    window.location.hash = `ilan/${listingId}`;
    setSelectedListingId(listingId);
    setPage('ilan-detay');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = useMemo(() => {
    if (page === 'ilanlar') {
      return <ListingsPage listings={listings} onNavigate={goTo} onOpenListing={openListing} />;
    }

    if (page === 'ilan-detay') {
      const selectedListing = listings.find((listing) => listing.id === selectedListingId);
      return <ListingDetailPage listing={selectedListing} onBack={() => goTo('ilanlar')} onNavigate={goTo} />;
    }

    if (page === 'ilan-ver') {
      return (
        <SubmitPage
          onSubmit={(listing) => {
            setListings((current) => [listing, ...current]);
            goTo('ilanlar');
          }}
        />
      );
    }

    return <HomePage onNavigate={goTo} />;
  }, [page, listings, selectedListingId]);

  return (
    <div className="min-h-screen bg-cream text-navy">
      <Header currentPage={page} onNavigate={goTo} />
      {storageMessage && (
        <div className="border-b border-turco/10 bg-blush px-4 py-3 text-center text-sm font-extrabold text-turco">
          {storageMessage}
        </div>
      )}
      <main>{content}</main>
      <Footer />
    </div>
  );
}
