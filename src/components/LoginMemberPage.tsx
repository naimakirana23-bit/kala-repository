import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookCategory, ReadingShelfStatus } from '../types/library';
import { BookCover } from './BookCover';

const CATEGORIES: BookCategory[] = [
  'Sastra',
  'Desain & Arsitektur',
  'Sains & Teknologi',
  'Sejarah & Budaya',
  'Pengembangan Diri',
];

const SHELF_LABELS: Record<ReadingShelfStatus, string> = {
  'currently-reading': 'Sedang Dibaca',
  'want-to-read': 'Ingin Dibaca',
  read: 'Sudah Dibaca',
};

export const LoginMemberPage: React.FC = () => {
  const {
    books,
    members,
    loans,
    reviews,
    shelves,
    currentMember,
    loginMember,
    loginDemoMember,
    registerMember,
    logoutMember,
    setActivePage,
    openBookReview,
    setShelfStatus,
    borrowBook,
  } = useLibrary();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState<BookCategory>('Sastra');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [shelfFilter, setShelfFilter] = useState<'all' | ReadingShelfStatus>('all');

  const memberStats = useMemo(() => {
    if (!currentMember) return { activeLoans: 0, returnedLoans: 0, reviewCount: 0 };
    return {
      activeLoans: loans.filter(
        (l) => l.memberId === currentMember.id && l.status === 'active'
      ).length,
      returnedLoans: loans.filter(
        (l) => l.memberId === currentMember.id && l.status === 'returned'
      ).length,
      reviewCount: reviews.filter((r) => r.memberId === currentMember.id).length,
    };
  }, [currentMember, loans, reviews]);

  const memberShelves = useMemo(() => {
    if (!currentMember) return [];
    return shelves.filter((s) => {
      if (s.memberId !== currentMember.id) return false;
      if (shelfFilter !== 'all' && s.status !== shelfFilter) return false;
      return true;
    });
  }, [currentMember, shelves, shelfFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'login') {
      const res = loginMember(email, password);
      if (!res.ok && res.error) setAuthError(res.error);
    } else {
      const res = registerMember(name, email, password, favoriteGenre);
      if (!res.ok && res.error) setAuthError(res.error);
    }
  };

  if (currentMember) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* Member Profile & Digital Library Card */}
        <section className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Digital Library Card */}
          <div className="lg:col-span-5 rounded-2xl border border-sky-300 bg-gradient-to-br from-sky-100 via-yellow-50 to-amber-100 p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-sky-800">Kartu Anggota Digital Kala</p>
                <h1 className="font-editorial text-2xl font-semibold text-slate-900 mt-1">
                  {currentMember.name}
                </h1>
                <p className="text-xs text-slate-700 mt-0.5">{currentMember.email}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300 text-slate-900 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="my-6 rounded-xl border border-amber-200 bg-yellow-50/95 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Nomor Anggota</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {currentMember.memberCode}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Bergabung Sejak</span>
                <span className="font-mono text-slate-800 tabular-nums">
                  {currentMember.joinedAt}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Kategori Favorit</span>
                <span className="font-medium text-sky-900">{currentMember.favoriteGenre}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActivePage('borrow')}
                className="flex-1 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 whitespace-nowrap"
              >
                Kelola Pinjaman
              </button>
              <button
                type="button"
                onClick={logoutMember}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-yellow-50 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-amber-100 whitespace-nowrap"
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar
              </button>
            </div>
          </div>

          {/* Reading Summary Metrics */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-5 rounded-2xl border border-amber-200 bg-yellow-100/55 p-6">
            <div>
              <p className="text-xs font-semibold text-sky-800">Ringkasan Aktivitas</p>
              <h2 className="font-editorial text-2xl font-semibold text-slate-900 mt-1">
                Jejak Bacaan Anda di Kala
              </h2>
              <p className="mt-2 text-sm text-slate-700">{currentMember.bio}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-4">
                <p className="text-xs text-slate-700">Pinjaman Aktif</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-sky-900 tabular-nums">
                  {memberStats.activeLoans} / 3
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-yellow-50 p-4">
                <p className="text-xs text-slate-700">Sudah Dikembalikan</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                  {memberStats.returnedLoans}
                </p>
              </div>
              <div className="rounded-xl border border-amber-300 bg-amber-200/60 p-4">
                <p className="text-xs text-slate-700">Ulasan Ditulis</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                  {memberStats.reviewCount}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-amber-200/80 pt-4">
              <button
                type="button"
                onClick={() => setActivePage('collection')}
                className="rounded-lg border border-amber-300 bg-yellow-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-amber-100"
              >
                Lihat Koleksi & Metadata
              </button>
              <button
                type="button"
                onClick={() => setActivePage('reviews')}
                className="rounded-lg border border-amber-300 bg-amber-200 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-amber-300"
              >
                Tulis Ulasan Baru
              </button>
            </div>
          </div>
        </section>

        {/* Personal Reading Shelves */}
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-amber-200 pb-4">
            <div>
              <p className="text-xs font-semibold text-sky-800">Koleksi Pribadi</p>
              <h2 className="font-editorial text-2xl font-semibold text-slate-900 mt-0.5">
                Rak Baca Saya
              </h2>
            </div>

            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-sky-200 bg-sky-100/60 p-1">
              {(['all', 'currently-reading', 'want-to-read', 'read'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setShelfFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    shelfFilter === tab
                      ? 'bg-yellow-50 text-sky-900 shadow-sm'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {tab === 'all' ? 'Semua Rak' : SHELF_LABELS[tab]}
                </button>
              ))}
            </div>
          </div>

          {memberShelves.length === 0 ? (
            <div className="rounded-xl border border-dashed border-amber-300 bg-yellow-100/50 p-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-sky-700 mb-2" />
              <p className="font-editorial text-lg font-semibold text-slate-900">
                Belum Ada Buku di Rak Ini
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Tandai buku di Beranda, Koleksi, atau Ulasan sebagai Ingin Dibaca, Sedang Dibaca, atau Sudah Dibaca.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {memberShelves.map((entry) => {
                const book = books.find((b) => b.id === entry.bookId);
                if (!book) return null;
                return (
                  <article
                    key={entry.bookId}
                    className="flex gap-4 rounded-xl border border-amber-200 bg-yellow-100/55 p-4"
                  >
                    <button
                      type="button"
                      onClick={() => openBookReview(book.id)}
                      className="w-20 shrink-0 text-left rounded-lg"
                    >
                      <BookCover book={book} />
                    </button>

                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <p className="text-[11px] font-semibold text-sky-800">
                          {SHELF_LABELS[entry.status]}
                        </p>
                        <button
                          type="button"
                          onClick={() => openBookReview(book.id)}
                          className="font-editorial text-base font-semibold text-slate-900 hover:text-sky-800 text-left line-clamp-2 mt-0.5"
                        >
                          {book.title}
                        </button>
                        <p className="text-xs text-slate-600 truncate">{book.author}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-200/80">
                        <button
                          type="button"
                          onClick={() => openBookReview(book.id)}
                          className="rounded-lg border border-amber-300 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-amber-100"
                        >
                          Ulasan
                        </button>
                        <button
                          type="button"
                          disabled={book.availableCopies <= 0}
                          onClick={() => borrowBook(book.id)}
                          className="rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                        >
                          Pinjam
                        </button>
                        <button
                          type="button"
                          onClick={() => setShelfStatus(book.id, null)}
                          className="text-[11px] text-slate-500 hover:text-red-700 ml-auto"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  /* Logged-Out View: Login & Register Split */
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
        {/* Left: Membership Info & 1-Click Demo Access */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-sky-300 bg-gradient-to-b from-sky-100 via-yellow-50 to-amber-100/80 p-6 sm:p-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-sky-800">Keanggotaan Perpustakaan Kala</p>
            <h1 className="font-editorial text-3xl font-semibold text-slate-900 leading-tight">
              Masuk ke Ruang Anggota Kala
            </h1>
            <p className="text-sm leading-relaxed text-slate-700">
              Satu akun anggota untuk meminjam koleksi buku selama 14 hari, melacak progres bacaan, menyusun rak pribadi, dan menulis ulasan bersama komunitas.
            </p>

            <ul className="space-y-2.5 pt-2 text-xs text-slate-800">
              <li className="flex items-start gap-2">
                <span className="font-mono font-semibold text-sky-800">01.</span>
                <span>Pinjam hingga 3 buku aktif secara bersamaan dengan perpanjangan 1 kali.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono font-semibold text-sky-800">02.</span>
                <span>Simpan daftar bacaan di rak Ingin Dibaca, Sedang Dibaca, dan Sudah Dibaca.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono font-semibold text-sky-800">03.</span>
                <span>Beri rating 1–5 bintang dan bagikan ulasan buku ala Goodreads.</span>
              </li>
            </ul>
          </div>

          {/* 1-Click Demo Account Selector */}
          <div className="mt-8 space-y-2.5 border-t border-sky-200 pt-5">
            <p className="text-xs font-semibold text-slate-800">
              Akses Cepat Akun Demo Anggota:
            </p>
            <div className="space-y-2">
              {members.slice(0, 2).map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => loginDemoMember(demo.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-amber-300 bg-yellow-50 px-4 py-2.5 text-left hover:border-sky-400 hover:bg-sky-50 transition-colors"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{demo.name}</p>
                    <p className="text-[11px] font-mono text-slate-600">{demo.email}</p>
                  </div>
                  <span className="rounded-lg bg-amber-300 px-2.5 py-1 text-[11px] font-semibold text-slate-900">
                    Masuk Demo
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Login / Register Form */}
        <div className="lg:col-span-7 rounded-2xl border border-amber-200 bg-yellow-100/55 p-6 sm:p-8 flex flex-col justify-center">
          <div className="inline-flex w-full rounded-xl border border-sky-200 bg-sky-100/60 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
              }}
              className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-colors ${
                authMode === 'login'
                  ? 'bg-yellow-50 text-sky-900 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Masuk Anggota
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
              }}
              className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-colors ${
                authMode === 'register'
                  ? 'bg-yellow-50 text-sky-900 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Daftar Anggota Baru
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label
                  htmlFor="member-name"
                  className="block text-xs font-semibold text-slate-800 mb-1.5"
                >
                  Nama Lengkap
                </label>
                <input
                  id="member-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Naima Kirana"
                  className="h-11 w-full rounded-lg border border-amber-300 bg-yellow-50 px-3.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="member-email"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Alamat Email Anggota
              </label>
              <input
                id="member-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@kala.id"
                className="h-11 w-full rounded-lg border border-amber-300 bg-yellow-50 px-3.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
            </div>

            <div>
              <label
                htmlFor="member-password"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="member-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="h-11 w-full rounded-lg border border-amber-300 bg-yellow-50 pl-3.5 pr-11 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label
                  htmlFor="member-genre"
                  className="block text-xs font-semibold text-slate-800 mb-1.5"
                >
                  Kategori Bacaan Favorit
                </label>
                <select
                  id="member-genre"
                  value={favoriteGenre}
                  onChange={(e) => setFavoriteGenre(e.target.value as BookCategory)}
                  className="h-11 w-full rounded-lg border border-amber-300 bg-yellow-50 px-3.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {authError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
            >
              {authMode === 'login' ? (
                'Masuk ke Akun Anggota'
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Buat Kartu Anggota Kala
                </>
              )}
            </button>
          </form>

          {authMode === 'login' && (
            <p className="mt-5 text-center text-xs text-slate-600">
              Kata sandi akun demo: <span className="font-mono text-slate-800">anggota123</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
