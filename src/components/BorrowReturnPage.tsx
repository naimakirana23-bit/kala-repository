import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookCheck,
  CalendarClock,
  CheckCircle2,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookCategory } from '../types/library';
import { BookCover } from './BookCover';

type BorrowTab = 'active' | 'catalog' | 'history';

const formatDateId = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const getDaysRemaining = (dueIso: string) => {
  const now = new Date();
  const due = new Date(dueIso);
  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const BorrowReturnPage: React.FC = () => {
  const {
    books,
    loans,
    currentMember,
    borrowBook,
    returnBook,
    renewLoan,
    updateLoanProgress,
    openBookReview,
    setActivePage,
  } = useLibrary();

  const [activeTab, setActiveTab] = useState<BorrowTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | BookCategory>('Semua');

  const memberActiveLoans = useMemo(() => {
    if (!currentMember) return [];
    return loans.filter((l) => l.memberId === currentMember.id && l.status === 'active');
  }, [loans, currentMember]);

  const memberHistoryLoans = useMemo(() => {
    if (!currentMember) return [];
    return loans.filter((l) => l.memberId === currentMember.id && l.status === 'returned');
  }, [loans, currentMember]);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((b) => {
      const catOk = categoryFilter === 'Semua' || b.category === categoryFilter;
      const qOk =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [books, searchQuery, categoryFilter]);

  const getBookById = (bookId: string) => books.find((b) => b.id === bookId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-amber-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-sky-800">Sirkulasi Perpustakaan Kala</p>
          <h1 className="font-editorial text-3xl font-semibold text-slate-900 sm:text-4xl mt-1">
            Pinjam & Kembalikan Buku
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">
            Kelola buku yang sedang Anda pinjam, perbarui progres membaca, perpanjang masa pinjam, atau kembalikan buku untuk membuka kuota pinjaman baru.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl border border-sky-200 bg-sky-100/75 px-4 py-2.5 text-right">
            <p className="text-[11px] font-medium text-slate-700">Kuota Pinjaman Aktif</p>
            <p className="font-mono text-lg font-semibold text-sky-900 tabular-nums">
              {memberActiveLoans.length} / 3 Buku
            </p>
          </div>
        </div>
      </div>

      {/* Member Login Banner if Not Signed In */}
      {!currentMember && (
        <div className="flex flex-col gap-4 rounded-xl border border-amber-300 bg-amber-100/80 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              Masuk sebagai anggota Kala untuk meminjam dan mengembalikan buku
            </p>
            <p className="text-xs text-slate-700">
              Anda tetap dapat meninjau ketersediaan koleksi di bawah ini. Masuk dengan akun anggota atau coba akun demo dalam satu klik.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('login')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 whitespace-nowrap shrink-0"
          >
            Masuk Anggota
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Segmented Tabs */}
      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-sky-200 bg-sky-100/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'active'
              ? 'bg-yellow-50 text-sky-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          Pinjaman Aktif ({memberActiveLoans.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'bg-yellow-50 text-sky-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          Pinjam Buku Baru ({books.filter((b) => b.availableCopies > 0).length} tersedia)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-yellow-50 text-sky-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-950'
          }`}
        >
          Riwayat Pengembalian ({memberHistoryLoans.length})
        </button>
      </div>

      {/* TAB 1: Active Loans */}
      {activeTab === 'active' && (
        <section className="space-y-4">
          {!currentMember ? (
            <div className="rounded-xl border border-dashed border-amber-300 bg-yellow-100/50 p-10 text-center">
              <p className="font-editorial text-lg font-semibold text-slate-900">
                Belum Ada Sesi Anggota Aktif
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Silakan masuk terlebih dahulu untuk melihat daftar buku yang sedang Anda pinjam.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePage('login')}
                  className="rounded-lg bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-700"
                >
                  Ke Laman Login Anggota
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="rounded-lg border border-amber-300 bg-yellow-50 px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-amber-100"
                >
                  Lihat Ketersediaan Buku
                </button>
              </div>
            </div>
          ) : memberActiveLoans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-amber-300 bg-yellow-100/50 p-10 text-center">
              <BookCheck className="mx-auto h-9 w-9 text-sky-700 mb-3" />
              <p className="font-editorial text-lg font-semibold text-slate-900">
                Tidak Ada Buku yang Sedang Dipinjam
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Kuota Anda masih kosong. Pilih judul dari katalog untuk mulai membaca selama 14 hari.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="mt-5 rounded-lg bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-700"
              >
                Pilih Buku untuk Dipinjam
              </button>
            </div>
          ) : (
            <div className="grid gap-5">
              {memberActiveLoans.map((loan) => {
                const book = getBookById(loan.bookId);
                if (!book) return null;
                const daysLeft = getDaysRemaining(loan.dueAt);
                const urgent = daysLeft <= 3;

                return (
                  <article
                    key={loan.id}
                    className="flex flex-col gap-5 rounded-xl border border-amber-200 bg-yellow-100/55 p-5 sm:flex-row sm:items-start"
                  >
                    <button
                      type="button"
                      onClick={() => openBookReview(book.id)}
                      className="w-24 sm:w-28 shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-lg"
                    >
                      <BookCover book={book} />
                    </button>

                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="font-medium text-sky-800">{book.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{book.callNumber}</span>
                          </div>
                          <h2 className="font-editorial text-xl font-semibold text-slate-900 mt-0.5">
                            {book.title}
                          </h2>
                          <p className="text-sm text-slate-700">{book.author}</p>
                        </div>

                        <div
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                            urgent
                              ? 'bg-amber-200 text-slate-900 border border-amber-400'
                              : 'bg-sky-100 text-sky-900 border border-sky-200'
                          }`}
                        >
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span className="tabular-nums">
                            {daysLeft > 0
                              ? `Sisa ${daysLeft} hari`
                              : daysLeft === 0
                              ? 'Jatuh tempo hari ini'
                              : `Terlambat ${Math.abs(daysLeft)} hari`}
                          </span>
                        </div>
                      </div>

                      {/* Dates Row */}
                      <div className="grid grid-cols-2 gap-3 rounded-lg border border-amber-200 bg-yellow-50/90 p-3 text-xs sm:grid-cols-3">
                        <div>
                          <p className="text-slate-600">Tanggal Pinjam</p>
                          <p className="font-mono font-medium text-slate-900 tabular-nums mt-0.5">
                            {formatDateId(loan.borrowedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Batas Kembali</p>
                          <p className="font-mono font-medium text-slate-900 tabular-nums mt-0.5">
                            {formatDateId(loan.dueAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Perpanjangan</p>
                          <p className="font-mono font-medium text-slate-900 tabular-nums mt-0.5">
                            {loan.renewCount} / 1 kali
                          </p>
                        </div>
                      </div>

                      {/* Reading Progress Tracker */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <label
                            htmlFor={`progress-${loan.id}`}
                            className="font-medium text-slate-800"
                          >
                            Progres Membaca Anda
                          </label>
                          <span className="font-mono font-semibold text-sky-800 tabular-nums">
                            {loan.readingProgress}%
                          </span>
                        </div>
                        <input
                          id={`progress-${loan.id}`}
                          type="range"
                          min={0}
                          max={100}
                          value={loan.readingProgress}
                          onChange={(e) =>
                            updateLoanProgress(loan.id, Number(e.target.value))
                          }
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => returnBook(loan.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Kembalikan Buku
                        </button>

                        <button
                          type="button"
                          disabled={loan.renewCount >= 1}
                          onClick={() => renewLoan(loan.id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                            loan.renewCount >= 1
                              ? 'border-amber-200 bg-amber-100/60 text-slate-400 cursor-not-allowed'
                              : 'border-amber-300 bg-amber-200 text-slate-900 hover:bg-amber-300'
                          }`}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {loan.renewCount >= 1 ? 'Sudah Diperpanjang' : 'Perpanjang +7 Hari'}
                        </button>

                        <button
                          type="button"
                          onClick={() => openBookReview(book.id)}
                          className="rounded-lg border border-amber-300 bg-yellow-50 px-4 py-2 text-xs font-medium text-slate-800 hover:bg-amber-100 whitespace-nowrap"
                        >
                          Tulis Ulasan
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Borrow Catalog */}
      {activeTab === 'catalog' && (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, penulis, subjek, atau ISBN untuk dipinjam..."
                className="h-11 w-full rounded-lg border border-amber-300 bg-yellow-50 pl-10 pr-4 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter kategori peminjaman"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'Semua' | BookCategory)}
              className="h-11 rounded-lg border border-amber-300 bg-yellow-50 px-3 text-sm text-slate-800 focus:border-sky-600 focus:outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Sastra">Sastra</option>
              <option value="Desain & Arsitektur">Desain & Arsitektur</option>
              <option value="Sains & Teknologi">Sains & Teknologi</option>
              <option value="Sejarah & Budaya">Sejarah & Budaya</option>
              <option value="Pengembangan Diri">Pengembangan Diri</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredCatalog.map((book) => {
              const alreadyBorrowed = memberActiveLoans.some((l) => l.bookId === book.id);
              const outOfStock = book.availableCopies <= 0;

              return (
                <article
                  key={book.id}
                  className="flex gap-4 rounded-xl border border-amber-200 bg-yellow-100/55 p-4"
                >
                  <button
                    type="button"
                    onClick={() => openBookReview(book.id)}
                    className="w-20 shrink-0 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                  >
                    <BookCover book={book} />
                  </button>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-medium text-sky-800">{book.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{book.pages} hlm</span>
                      </div>
                      <h3 className="font-editorial text-base font-semibold text-slate-900 mt-0.5 truncate">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-700 truncate">{book.author}</p>
                      <p className="text-[11px] text-slate-600 truncate mt-1">{book.accessRights}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-amber-200/80">
                      <span
                        className={`text-xs font-mono tabular-nums ${
                          outOfStock ? 'text-amber-900' : 'text-slate-700'
                        }`}
                      >
                        {book.availableCopies} dari {book.totalCopies} tersedia
                      </span>

                      {alreadyBorrowed ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab('active')}
                          className="rounded-lg border border-sky-300 bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-900 whitespace-nowrap"
                        >
                          Sudah Dipinjam
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={outOfStock}
                          onClick={() => borrowBook(book.id)}
                          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                            outOfStock
                              ? 'bg-amber-100 text-slate-400 cursor-not-allowed'
                              : 'bg-sky-600 text-white hover:bg-sky-700'
                          }`}
                        >
                          {outOfStock ? 'Habis' : 'Pinjam Sekarang'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: Return History */}
      {activeTab === 'history' && (
        <section>
          {!currentMember || memberHistoryLoans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-amber-300 bg-yellow-100/50 p-10 text-center">
              <p className="font-editorial text-lg font-semibold text-slate-900">
                Belum Ada Riwayat Pengembalian
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Buku yang sudah selesai Anda baca dan dikembalikan akan tercatat rapi di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-amber-200 bg-yellow-100/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-amber-200 bg-sky-100/75 text-xs font-semibold text-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Judul Buku</th>
                      <th className="px-4 py-3.5">Dipinjam</th>
                      <th className="px-4 py-3.5">Dikembalikan</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200/70">
                    {memberHistoryLoans.map((loan) => {
                      const book = getBookById(loan.bookId);
                      if (!book) return null;
                      return (
                        <tr key={loan.id} className="hover:bg-yellow-100">
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-slate-900">{book.title}</p>
                            <p className="text-xs text-slate-600">{book.author}</p>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                            {formatDateId(loan.borrowedAt)}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                            {loan.returnedAt ? formatDateId(loan.returnedAt) : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-medium text-sky-900 whitespace-nowrap">
                            Dikembalikan
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                            <button
                              type="button"
                              onClick={() => openBookReview(book.id)}
                              className="rounded-lg border border-amber-300 bg-amber-200/80 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-amber-300"
                            >
                              Tulis Ulasan
                            </button>
                            <button
                              type="button"
                              disabled={book.availableCopies <= 0}
                              onClick={() => borrowBook(book.id)}
                              className="rounded-lg border border-sky-200 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-sky-100 disabled:opacity-50"
                            >
                              Pinjam Lagi
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
