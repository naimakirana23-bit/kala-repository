import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  FileText,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
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

export const CollectionPage: React.FC = () => {
  const {
    books,
    loans,
    currentMember,
    borrowBook,
    openBookReview,
    getBookRatingStats,
    getShelfStatus,
    setShelfStatus,
    setActivePage,
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | BookCategory>('Semua');
  const [accessFilter, setAccessFilter] = useState<'Semua' | 'Publik' | 'Anggota'>('Semua');
  const [inspectBook, setInspectBook] = useState<Book | null>(null);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((book) => {
      const catOk = selectedCategory === 'Semua' || book.category === selectedCategory;
      const accessOk =
        accessFilter === 'Semua' ||
        (accessFilter === 'Publik' && book.accessRights.toLowerCase().includes('publik')) ||
        (accessFilter === 'Anggota' && book.accessRights.toLowerCase().includes('anggota'));
      const queryOk =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.subject.toLowerCase().includes(q) ||
        book.format.toLowerCase().includes(q) ||
        book.accessRights.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q);
      return catOk && accessOk && queryOk;
    });
  }, [books, searchQuery, selectedCategory, accessFilter]);

  const isBorrowedByMe = (bookId: string) =>
    Boolean(
      currentMember &&
        loans.some(
          (l) => l.bookId === bookId && l.memberId === currentMember.id && l.status === 'active'
        )
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-amber-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-sky-700">Direktori Koleksi Kala</p>
          <h1 className="font-editorial text-3xl font-semibold text-slate-900 sm:text-4xl mt-1">
            Koleksi & Metadata Buku
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">
            Telusuri seluruh koleksi digital Kala beserta metadata bibliografis lengkap yang mencakup judul, penulis, subjek, format berkas, dan ketentuan hak akses.
          </p>
        </div>

        <div className="rounded-xl border border-sky-200 bg-sky-100/70 px-4 py-2.5 text-right shrink-0">
          <p className="text-[11px] font-medium text-slate-600">Total Entri Koleksi</p>
          <p className="font-mono text-lg font-semibold text-sky-900 tabular-nums">
            {filteredBooks.length} / {books.length} Judul
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <section className="rounded-2xl border border-amber-200 bg-amber-100/50 p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-8">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan judul, penulis, subjek, format, atau hak akses..."
              aria-label="Cari koleksi dan metadata buku"
              className="h-11 w-full rounded-lg border border-amber-300 bg-yellow-50 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian koleksi"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-600 shrink-0" aria-hidden="true" />
            <select
              aria-label="Filter hak akses"
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value as 'Semua' | 'Publik' | 'Anggota')}
              className="h-11 w-full rounded-lg border border-amber-300 bg-yellow-50 px-3 text-sm font-medium text-slate-800 focus:border-sky-600 focus:outline-none"
            >
              <option value="Semua">Hak Akses: Semua</option>
              <option value="Publik">Akses Terbuka Publik</option>
              <option value="Anggota">Akses Khusus Anggota</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-sky-600 text-white'
                    : 'border border-amber-300 bg-yellow-50 text-slate-700 hover:bg-sky-100 hover:text-sky-900'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Collection List with Explicit 5-Field Metadata */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-amber-300 bg-yellow-100/50 p-10 text-center">
          <p className="font-editorial text-lg font-semibold text-slate-900">
            Tidak ada koleksi yang sesuai dengan filter Anda
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
              setAccessFilter('Semua');
            }}
            className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
          >
            Reset Filter Koleksi
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredBooks.map((book) => {
            const stats = getBookRatingStats(book.id);
            const shelfStatus = getShelfStatus(book.id);
            const borrowed = isBorrowedByMe(book.id);

            return (
              <article
                key={book.id}
                className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-yellow-100/55 p-5 space-y-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setInspectBook(book)}
                    className="w-28 shrink-0 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                  >
                    <BookCover book={book} />
                  </button>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-sky-800">
                          {book.category} · <span className="font-mono tabular-nums">{book.year}</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setInspectBook(book)}
                          className="font-editorial text-lg font-semibold leading-snug text-slate-900 hover:text-sky-800 text-left mt-0.5"
                        >
                          {book.title}
                        </button>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <StarDisplay rating={stats.average} />
                        <span className="font-mono text-xs text-slate-700 tabular-nums">
                          {stats.average > 0 ? stats.average.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Structured Metadata Table: Judul, Penulis, Subjek, Format, Hak Akses */}
                    <dl className="divide-y divide-amber-200/80 rounded-xl border border-amber-200 bg-yellow-50/90 px-3.5 py-1 text-xs">
                      <div className="grid grid-cols-12 gap-2 py-2">
                        <dt className="col-span-4 font-semibold text-slate-600">Judul</dt>
                        <dd className="col-span-8 font-medium text-slate-900">{book.title}</dd>
                      </div>
                      <div className="grid grid-cols-12 gap-2 py-2">
                        <dt className="col-span-4 font-semibold text-slate-600">Penulis</dt>
                        <dd className="col-span-8 text-slate-800">{book.author}</dd>
                      </div>
                      <div className="grid grid-cols-12 gap-2 py-2">
                        <dt className="col-span-4 font-semibold text-slate-600">Subjek</dt>
                        <dd className="col-span-8 text-slate-800">{book.subject}</dd>
                      </div>
                      <div className="grid grid-cols-12 gap-2 py-2">
                        <dt className="col-span-4 font-semibold text-slate-600">Format</dt>
                        <dd className="col-span-8 font-mono text-[11px] text-slate-800">
                          {book.format}
                        </dd>
                      </div>
                      <div className="grid grid-cols-12 gap-2 py-2">
                        <dt className="col-span-4 font-semibold text-slate-600">Hak Akses</dt>
                        <dd className="col-span-8 font-medium text-sky-800">
                          {book.accessRights}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/90 pt-3">
                  <span className="font-mono text-xs text-slate-700 tabular-nums">
                    {book.availableCopies}/{book.totalCopies} eksemplar tersedia
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
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
                          : 'border-amber-300 bg-yellow-50 text-slate-600 hover:text-sky-800'
                      }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${shelfStatus ? 'fill-slate-900' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectBook(book)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-100/80 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-sky-200 whitespace-nowrap"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Metadata Lengkap
                    </button>

                    <button
                      type="button"
                      onClick={() => openBookReview(book.id)}
                      className="rounded-lg border border-amber-300 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-amber-200/60 whitespace-nowrap"
                    >
                      Ulasan
                    </button>

                    {borrowed ? (
                      <button
                        type="button"
                        onClick={() => setActivePage('borrow')}
                        className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-900 whitespace-nowrap"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Dipinjam
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={book.availableCopies <= 0}
                        onClick={() => borrowBook(book.id)}
                        className="rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-500 whitespace-nowrap"
                      >
                        {book.availableCopies > 0 ? 'Pinjam' : 'Habis'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Full Metadata Modal */}
      {inspectBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="metadata-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-amber-300 bg-yellow-50 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-amber-200 pb-4">
              <div>
                <p className="text-xs font-semibold text-sky-800">Catatan Metadata Bibliografis Kala</p>
                <h2
                  id="metadata-modal-title"
                  className="font-editorial text-2xl font-semibold text-slate-900 mt-0.5"
                >
                  {inspectBook.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectBook(null)}
                aria-label="Tutup detail metadata"
                className="rounded-lg border border-amber-300 bg-yellow-100 p-2 text-slate-700 hover:bg-sky-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-6 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <BookCover book={inspectBook} />
              </div>

              <div className="sm:col-span-8 space-y-4">
                <p className="text-sm leading-relaxed text-slate-700">{inspectBook.synopsis}</p>

                <dl className="divide-y divide-amber-200 rounded-xl border border-amber-200 bg-amber-100/45 px-4 py-1 text-xs">
                  <div className="grid grid-cols-12 gap-2 py-2.5">
                    <dt className="col-span-4 font-semibold text-slate-600">Judul</dt>
                    <dd className="col-span-8 font-semibold text-slate-900">{inspectBook.title}</dd>
                  </div>
                  <div className="grid grid-cols-12 gap-2 py-2.5">
                    <dt className="col-span-4 font-semibold text-slate-600">Penulis</dt>
                    <dd className="col-span-8 text-slate-900">{inspectBook.author}</dd>
                  </div>
                  <div className="grid grid-cols-12 gap-2 py-2.5">
                    <dt className="col-span-4 font-semibold text-slate-600">Subjek</dt>
                    <dd className="col-span-8 text-slate-900">{inspectBook.subject}</dd>
                  </div>
                  <div className="grid grid-cols-12 gap-2 py-2.5">
                    <dt className="col-span-4 font-semibold text-slate-600">Format</dt>
                    <dd className="col-span-8 font-mono text-slate-900">{inspectBook.format}</dd>
                  </div>
                  <div className="grid grid-cols-12 gap-2 py-2.5">
                    <dt className="col-span-4 font-semibold text-slate-600">Hak Akses</dt>
                    <dd className="col-span-8 font-semibold text-sky-800">
                      {inspectBook.accessRights}
                    </dd>
                  </div>
                  <div className="grid grid-cols-12 gap-2 py-2.5">
                    <dt className="col-span-4 font-semibold text-slate-600">Penerbit & Tahun</dt>
                    <dd className="col-span-8 text-slate-800 tabular-nums">
                      {inspectBook.publisher} · {inspectBook.year}
                    </dd>
                  </div>
                  <div className="grid grid-cols-12 gap-2 py-2.5">
                    <dt className="col-span-4 font-semibold text-slate-600">ISBN / Panggil</dt>
                    <dd className="col-span-8 font-mono text-slate-800 tabular-nums">
                      {inspectBook.isbn} · {inspectBook.callNumber}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={inspectBook.availableCopies <= 0 || isBorrowedByMe(inspectBook.id)}
                    onClick={() => {
                      borrowBook(inspectBook.id);
                      setInspectBook(null);
                    }}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    {isBorrowedByMe(inspectBook.id) ? 'Sedang Anda Pinjam' : 'Pinjam Buku Ini'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = inspectBook.id;
                      setInspectBook(null);
                      openBookReview(id);
                    }}
                    className="rounded-lg border border-sky-300 bg-sky-100 px-4 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-200"
                  >
                    Lihat Ulasan Pembaca
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
