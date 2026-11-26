import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { PageView } from '../types/library';

const NAV_ITEMS: { id: PageView; label: string }[] = [
  { id: 'home', label: 'Beranda' },
  { id: 'collection', label: 'Koleksi' },
  { id: 'borrow', label: 'Pinjam & Kembali' },
  { id: 'reviews', label: 'Ulasan Buku' },
  { id: 'login', label: 'Anggota' },
];

export const Navbar: React.FC = () => {
  const { activePage, setActivePage, currentMember } = useLibrary();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: PageView) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const firstName = currentMember ? currentMember.name.split(' ')[0] : null;

  return (
    <header className="sticky top-0 z-40 border-b border-amber-200/90 bg-yellow-50/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="font-editorial text-2xl font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded"
        >
          Kala
        </button>

        {/* Zone 2: 5 Single-line Text Nav Links */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded ${
                  isActive
                    ? 'text-sky-800 font-semibold'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[19px] h-[2px] bg-sky-600"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('login')}
            className={`hidden md:inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 ${
              currentMember
                ? 'bg-sky-100 text-sky-900 border border-sky-300 hover:bg-sky-200'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            {currentMember ? `Halo, ${firstName}` : 'Masuk Anggota'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-lg border border-amber-300 bg-yellow-100 text-slate-800 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-200 bg-yellow-50 px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-100 text-sky-900 font-semibold'
                    : 'text-slate-700 hover:bg-yellow-100'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-amber-200">
            <button
              type="button"
              onClick={() => handleNav('login')}
              className="w-full rounded-lg bg-sky-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-sky-700"
            >
              {currentMember ? `Akun Anggota (${firstName})` : 'Masuk Anggota'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
