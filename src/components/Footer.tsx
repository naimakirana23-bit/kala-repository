import React from 'react';
import { useLibrary } from '../context/LibraryContext';

export const Footer: React.FC = () => {
  const { setActivePage } = useLibrary();

  return (
    <footer className="mt-20 border-t border-amber-200 bg-sky-100/70">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <p className="font-editorial text-xl font-semibold text-slate-900">Kala</p>
            <p className="text-sm leading-relaxed text-slate-700 max-w-xs">
              Perpustakaan digital terbuka untuk menelusuri metadata koleksi, meminjam buku pilihan, dan berbagi ulasan bersama komunitas pembaca.
            </p>
          </div>

          <div className="space-y-2.5 text-sm">
            <p className="font-semibold text-slate-900">Layanan Utama</p>
            <ul className="space-y-2 text-slate-700">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('home')}
                  className="hover:text-sky-800 transition-colors"
                >
                  Beranda & Rekomendasi
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('collection')}
                  className="hover:text-sky-800 transition-colors"
                >
                  Koleksi & Metadata Buku
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('borrow')}
                  className="hover:text-sky-800 transition-colors"
                >
                  Peminjaman & Pengembalian
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('reviews')}
                  className="hover:text-sky-800 transition-colors"
                >
                  Ulasan Komunitas Pembaca
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePage('login')}
                  className="hover:text-sky-800 transition-colors"
                >
                  Portal Anggota Digital
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm">
            <p className="font-semibold text-slate-900">Ketentuan Sirkulasi</p>
            <p className="text-slate-700 leading-relaxed">
              Maksimal 3 buku aktif per anggota dengan masa pinjam 14 hari kalender dan opsi perpanjangan 1 kali selama 7 hari.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-sky-200/80 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kala. Perpustakaan Digital Minimalis.</p>
          <p>Palet kuning hangat dan biru muda untuk kenyamanan membaca.</p>
        </div>
      </div>
    </footer>
  );
};
