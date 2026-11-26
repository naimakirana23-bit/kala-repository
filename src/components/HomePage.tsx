import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { HERO_LIBRARY_IMAGE } from '../data/catalog';
import { useLibrary } from '../context/LibraryContext';
import { Book, BookCategory } from '../types/library';
import { BookCover } from './BookCover';
import { StarDisplay } from './StarRating';

const CATEGORIES: ('Semua' | BookCategory)[] = [
  'Semua',
  'Sastra',
  'Desain & Arsitektur',
  'Sains & Teknologi',
  'Sejarah & Budaya',
  'Pengembangan Diri',
];

type SortOption = 'recommended' | 'rating' | 'newest' | 'title';

export const HomePage: React.FC = () => {
  const {
    books,
    reviews,
    loans,
    currentMember,
    borrowBook,
    openBookReview,
    setActivePage,
    getBookRatingStats,
    getShelfStatus,
    setShelfStatus,
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | BookCategory>('Semua');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [heroImgError, setHeroImgError] = useState(false);

  const recommendedBooks = useMemo(
    () => books.filter((b) => b.featured).slice(0, 4),
    [books]
  );

  const totalAvailableCopies = useMemo(
    () => books.reduce((sum, b) => sum + b.availableCopies, 0),
    [books]
  );

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = books.filter((book) => {
      const matchesCategory =
        selectedCategory === 'Semua' || book.category === selectedCategory;
      const matchesAvailability = !onlyAvailable || book.availableCopies > 0;
      const matchesQuery =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.subject.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        book.synopsis.toLowerCase().includes(q);
      return matchesCategory && matchesAvailability && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'rating') {
        return getBookRatingStats(b.id).average - getBookRatingStats(a.id).average;
      }
      if (sortBy === 'newest') {
        return b.year - a.year;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'id');
      }
      const aScore = a.featured ? 1 : 0;
      const bScore = b.featured ? 1 : 0;
      if (bScore !== aScore) return bScore - aScore;
      return getBookRatingStats(b.id).average - getBookRatingStats(a.id).average;
    });
  }, [books, searchQuery, selectedCategory, onlyAvailable, sortBy, getBookRatingStats]);

  const isBookCurrentlyBorrowed = (bookId: string) =>
    Boolean(
      currentMember &&
        loans.some(
          (l) => l.bookId === bookId && l.memberId === currentMember.id && l.status === 'active'
        )
    );

  const scrollToCatalog = () => {
    const el = document.getElementById('katalog-buku');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderBookAction = (book: Book) => {
    const borrowedByMe = isBookCurrentlyBorrowed(book.id);
    if (borrowedByMe) {
      return (
        <button
          type="button"
          onClick={() => setActivePage('borrow')}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sky-300 bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-200 transition-colors whitespace-nowrap"
        >
          <Check className="h-3.5 w-3.5" />
          Sedang Dipinjam
        </button>
      );
    }

    if (book.availableCopies === 0) {
      return (
        <button
          type="button"
          disabled
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-amber-200 bg-amber-100/70 px-3 py-2 text-xs font-medium text-slate-500 cursor-not-allowed whitespace-nowrap"
        >
          Stok Dipinjam
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => borrowBook(book.id)}
        className="inline-flex flex-1 items-center justify-center rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-1"
      >
        Pinjam Buku
      </button>
    );
  };

  return (
    <div className="space-y-16 pb-8">
      {/* Hero Split Section */}
      <section className="border-b border-amber-200 bg-gradient-to-b from-sky-100/65 via-yellow-50 to-yellow-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6 py-2">
              <div className="space-y-5">
                <p className="text-xs font-semibold tracking-wide text-sky-800">
                  Perpustakaan Digital Kala · Koleksi Kurasi 2026
                </p>

                <h1 className="font-editorial text-4xl font-semibold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl">
                  Ruang Baca Digital yang Tenang & Terbuka
                </h1>

                <p className="max-w-xl text-base leading-relaxed text-slate-700">
                  Temukan rekomendasi bacaan pilihan di Kala, periksa metadata lengkap tiap koleksi, pinjam dan kembalikan buku secara daring, serta bagikan ulasan bersama komunitas pembaca.
                </p>

                {/* Primary Search Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    scrollToCatalog();
                  }}
                  className="pt-1"
                >
                  <label htmlFor="hero-search" className="sr-only">
                    Cari judul buku, penulis, subjek, atau ISBN
                  </label>
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <div className="relative flex-1">
                      <Search
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        aria-hidden="true"
                      />
                      <input
                        id="hero-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari judul buku, penulis, subjek, atau ISBN..."
                        className="h-12 w-full rounded-lg border border-amber-300 bg-yellow-50 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          aria-label="Hapus pencarian"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 text-sm font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                    >
                      Cari Koleksi
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Genre Shortcuts & Secondary CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-amber-200/80 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  {(['Sastra', 'Desain & Arsitektur', 'Sains & Teknologi'] as BookCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          scrollToCatalog();
                        }}
                        className="rounded-lg border border-sky-300 bg-sky-100/80 px-3 py-1.5 text-xs font-medium text-sky-950 hover:bg-amber-200 hover:border-amber-300 transition-colors whitespace-nowrap"
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage('collection')}
                  className="text-sm font-semibold text-sky-800 hover:text-sky-950 underline underline-offset-4 whitespace-nowrap"
                >
                  Buka Laman Koleksi & Metadata
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-5">
              <div className="h-64 sm:h-80 lg:h-full min-h-[300px] w-full overflow-hidden rounded-xl border border-amber-200 bg-sky-100">
                {!heroImgError ? (
                  <img
                    src={HERO_LIBRARY_IMAGE}
                    alt="Ruang baca Kala dengan rak buku biru muda dan lampu meja kuning hangat"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-yellow-50 to-amber-100 p-8 text-center">
                    <BookOpen className="h-10 w-10 text-sky-700 mb-3" />
                    <p className="font-editorial text-xl font-semibold text-slate-900">Kala</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Ruang Baca Digital Minimalis
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4-Column Library Strip Below Hero Split */}
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-amber-200 bg-yellow-100/70 p-4">
              <p className="text-xs font-medium text-slate-600">Koleksi Judul</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                {books.length} Buku
              </p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-100/70 p-4">
              <p className="text-xs font-medium text-slate-700">Eksemplar Tersedia</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-sky-900 tabular-nums">
                {totalAvailableCopies} Unit
              </p>
            </div>
            <div className="rounded-xl border border-amber-300 bg-amber-200/60 p-4">
              <p className="text-xs font-medium text-slate-700">Masa Pinjam</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                14 Hari
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-yellow-100/70 p-4">
              <p className="text-xs font-medium text-slate-600">Ulasan Komunitas</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                {reviews.length} Ulasan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rekomendasi Buku Pilihan */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-amber-200 pb-4">
          <div>
            <p className="text-xs font-semibold text-sky-800">Kurasi Pustakawan Kala</p>
            <h2 className="font-editorial text-2xl font-semibold text-slate-900 sm:text-3xl mt-0.5">
              Rekomendasi Buku Pilihan
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('reviews')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-800 hover:text-sky-950 whitespace-nowrap"
          >
            Bandingkan Ulasan Pembaca
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recommendedBooks.map((book) => {
            const stats = getBookRatingStats(book.id);
            const shelfStatus = getShelfStatus(book.id);
            return (
              <article
                key={book.id}
                className="group flex flex-col justify-between rounded-xl border border-amber-200 bg-yellow-100/55 p-4 transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => openBookReview(book.id)}
                    className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-lg"
                  >
                    <BookCover book={book} />
                  </button>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                      <span className="text-sky-800 font-medium">{book.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{book.year}</span>
                      <span aria-hidden="true">·</span>
                      <span className={book.availableCopies > 0 ? 'text-slate-800' : 'text-amber-900'}>
                        {book.availableCopies > 0 ? `${book.availableCopies} tersedia` : 'Habis'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openBookReview(book.id)}
                      className="block text-left"
                    >
                      <h3 className="font-editorial text-base font-semibold leading-snug text-slate-900 group-hover:text-sky-800 transition-colors line-clamp-2">
                        {book.title}
                      </h3>
                    </button>

                    <p className="text-xs text-slate-700 truncate">{book.author}</p>

                    <div className="flex items-center gap-2 pt-1">
                      <StarDisplay rating={stats.average} />
                      <span className="text-xs font-mono text-slate-700 tabular-nums">
                        {stats.average > 0 ? stats.average.toFixed(1) : 'Baru'}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        ({stats.total})
                      </span>
                    </div>

                    {book.recommendedReason && (
                      <p className="pt-1 text-xs font-medium text-sky-950 bg-sky-100/80 rounded px-2 py-1">
                        {book.recommendedReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-amber-200/80 pt-3">
                  {renderBookAction(book)}
                  <button
                    type="button"
                    onClick={() => openBookReview(book.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-yellow-50 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-amber-200/60 transition-colors whitespace-nowrap"
                  >
                    Ulasan
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setShelfStatus(book.id, shelfStatus === 'want-to-read' ? null : 'want-to-read')
                    }
                    aria-label={
                      shelfStatus === 'want-to-read'
                        ? 'Hapus dari Ingin Dibaca'
                        : 'Simpan ke Ingin Dibaca'
                    }
                    title="Simpan ke Rak Ingin Dibaca"
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors shrink-0 ${
                      shelfStatus
                        ? 'border-amber-400 bg-amber-300 text-slate-900'
                        : 'border-amber-300 bg-yellow-50 text-slate-600 hover:text-sky-800 hover:border-sky-300'
                    }`}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${shelfStatus ? 'fill-slate-900' : ''}`} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Katalog Lengkap & Pencarian */}
      <section id="katalog-buku" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-sky-200 bg-sky-100/55 p-5 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold text-sky-800">Katalog Perpustakaan Kala</p>
              <h2 className="font-editorial text-2xl font-semibold text-slate-900 sm:text-3xl mt-0.5">
                Jelajahi Seluruh Koleksi
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-400 text-sky-600 focus:ring-sky-600"
                />
                Hanya yang tersedia
              </label>

              <div className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                <select
                  aria-label="Urutkan katalog"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-lg border border-sky-200 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-sky-600 focus:outline-none"
                >
                  <option value="recommended">Urutan: Rekomendasi</option>
                  <option value="rating">Urutan: Rating Tertinggi</option>
                  <option value="newest">Urutan: Terbit Terbaru</option>
                  <option value="title">Urutan: Judul A–Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter katalog berdasarkan judul, penulis, subjek, atau kata kunci..."
                aria-label="Filter katalog buku"
                className="h-11 w-full rounded-lg border border-sky-200 bg-yellow-50 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Bersihkan kata kunci"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-sky-600 text-white'
                        : 'bg-yellow-50 text-slate-700 border border-sky-200 hover:text-slate-950 hover:border-sky-400'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Grid */}
          {filteredBooks.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-sky-300 bg-yellow-50 p-10 text-center">
              <p className="font-editorial text-lg font-semibold text-slate-900">
                Tidak ada buku yang cocok dengan pencarian Anda
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Coba ubah kata kunci atau pilih kategori lain untuk menampilkan koleksi.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                  setOnlyAvailable(false);
                }}
                className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
              >
                Reset Filter Katalog
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => {
                const stats = getBookRatingStats(book.id);
                const shelfStatus = getShelfStatus(book.id);

                return (
                  <article
                    key={book.id}
                    className="flex flex-col justify-between rounded-xl border border-amber-200 bg-yellow-50 p-4 transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => openBookReview(book.id)}
                        className="w-24 shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-lg"
                      >
                        <BookCover book={book} />
                      </button>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 truncate">
                          <span className="font-medium text-sky-800">{book.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{book.year}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openBookReview(book.id)}
                          className="block text-left"
                        >
                          <h3 className="font-editorial text-base font-semibold leading-snug text-slate-900 hover:text-sky-800 transition-colors line-clamp-2">
                            {book.title}
                          </h3>
                        </button>

                        <p className="text-xs text-slate-700 truncate">{book.author}</p>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <StarDisplay rating={stats.average} />
                          <span className="text-xs font-mono text-slate-800 tabular-nums">
                            {stats.average > 0 ? stats.average.toFixed(1) : '—'}
                          </span>
                          <span className="text-[11px] text-slate-500 tabular-nums">
                            · {stats.total} ulasan
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 truncate pt-0.5">
                          {book.format}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-amber-200/80 pt-3">
                      <span className="text-[11px] font-mono text-slate-600 tabular-nums whitespace-nowrap">
                        {book.availableCopies}/{book.totalCopies} tersedia
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setShelfStatus(
                              book.id,
                              shelfStatus === 'want-to-read' ? null : 'want-to-read'
                            )
                          }
                          aria-label="Simpan ke rak baca"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                            shelfStatus
                              ? 'border-amber-400 bg-amber-300 text-slate-900'
                              : 'border-amber-300 bg-yellow-100/70 text-slate-600 hover:text-sky-800'
                          }`}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${shelfStatus ? 'fill-slate-900' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openBookReview(book.id)}
                          className="rounded-lg border border-amber-300 bg-yellow-100/70 px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-amber-200/70 whitespace-nowrap"
                        >
                          Ulasan
                        </button>
                        {renderBookAction(book)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Fitur Layanan Perpustakaan Kala */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-amber-200 bg-yellow-100/60 p-6 space-y-2.5">
            <p className="font-mono text-xs font-medium text-sky-800">01. Koleksi & Metadata</p>
            <h3 className="font-editorial text-lg font-semibold text-slate-900">
              Metadata Bibliografis Lengkap
            </h3>
            <p className="text-sm leading-relaxed text-slate-700">
              Setiap judul dilengkapi metadata terstruktur mencakup judul, penulis, subjek, format digital, hingga hak akses peminjaman.
            </p>
            <button
              type="button"
              onClick={() => setActivePage('collection')}
              className="pt-1 text-xs font-semibold text-sky-800 hover:text-sky-950 underline underline-offset-4"
            >
              Buka Laman Koleksi
            </button>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-200/55 p-6 space-y-2.5">
            <p className="font-mono text-xs font-medium text-slate-800">02. Komunitas Pembaca</p>
            <h3 className="font-editorial text-lg font-semibold text-slate-900">
              Ulasan & Rak Baca ala Goodreads
            </h3>
            <p className="text-sm leading-relaxed text-slate-700">
              Lihat distribusi rating 1–5 bintang, tandai buku ke rak Ingin Dibaca atau Sudah Dibaca, dan bagikan ulasan lengkap dengan penanda spoiler.
            </p>
            <button
              type="button"
              onClick={() => setActivePage('reviews')}
              className="pt-1 text-xs font-semibold text-sky-900 hover:text-sky-950 underline underline-offset-4"
            >
              Baca Ulasan Komunitas
            </button>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-100/65 p-6 space-y-2.5">
            <p className="font-mono text-xs font-medium text-sky-800">03. Sirkulasi & Anggota</p>
            <h3 className="font-editorial text-lg font-semibold text-slate-900">
              Pinjam, Kembalikan & Kartu Kala
            </h3>
            <p className="text-sm leading-relaxed text-slate-700">
              Masuk sebagai anggota Kala untuk meminjam hingga 3 buku sekaligus selama 14 hari, melacak progres baca, dan mengembalikan kapan saja.
            </p>
            <button
              type="button"
              onClick={() => setActivePage('borrow')}
              className="pt-1 text-xs font-semibold text-sky-900 hover:text-sky-950 underline underline-offset-4"
            >
              Buka Laman Pinjam & Kembali
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
