import ListingDetailView from '../components/ListingDetailView.jsx';

export default function ListingDetailPage({ listing, onBack, onNavigate }) {
  return <ListingDetailView listing={listing} onBack={onBack} onNavigate={onNavigate} />;
}
