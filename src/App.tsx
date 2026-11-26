import React from 'react';
import { X } from 'lucide-react';
import { BorrowReturnPage } from './components/BorrowReturnPage';
import { CollectionPage } from './components/CollectionPage';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { LoginMemberPage } from './components/LoginMemberPage';
import { Navbar } from './components/Navbar';
import { ReviewsPage } from './components/ReviewsPage';
import { LibraryProvider, useLibrary } from './context/LibraryContext';

const LibraryShell: React.FC = () => {
  const { activePage, toast, dismissToast } = useLibrary();

  return (
    <div className="min-h-screen flex flex-col bg-yellow-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        {activePage === 'home' && <HomePage />}
        {activePage === 'collection' && <CollectionPage />}
        {activePage === 'borrow' && <BorrowReturnPage />}
        {activePage === 'reviews' && <ReviewsPage />}
        {activePage === 'login' && <LoginMemberPage />}
      </main>

      <Footer />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-xs font-medium shadow-lg transition-all duration-150 ${
            toast.tone === 'error'
              ? 'border-red-300 bg-red-50 text-red-900'
              : toast.tone === 'yellow'
              ? 'border-amber-400 bg-amber-200 text-slate-900'
              : 'border-sky-300 bg-sky-100 text-sky-950'
          }`}
        >
          <span className="flex-1 leading-relaxed">{toast.message}</span>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Tutup notifikasi"
            className="rounded p-1 hover:bg-black/5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <LibraryProvider>
      <LibraryShell />
    </LibraryProvider>
  );
}
