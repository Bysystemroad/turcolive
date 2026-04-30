import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('TurcoLive uygulama hatası:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-porcelain px-4 py-12 text-navy">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-navy/10 bg-white p-8 text-center shadow-card">
            <img
              className="mx-auto h-16 w-16 rounded-2xl object-contain"
              src="/brand/turcolive-symbol-cropped.png"
              alt="TurcoLive logosu"
            />
            <h1 className="mt-6 text-2xl font-black">Bir şeyler ters gitti.</h1>
            <p className="mt-3 text-sm leading-6 text-navy/65">
              Sayfa yüklenirken beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-turco px-6 py-3 text-sm font-black text-white shadow-card transition hover:bg-coral"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
