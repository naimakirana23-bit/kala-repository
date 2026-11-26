import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  Eye,
  MessageSquare,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { ReadingShelfStatus } from '../types/library';
import { BookCover } from './BookCover';
import { StarDisplay, StarPicker } from './StarRating';

const SHELF_LABELS: Record<ReadingShelfStatus, string> = {
  'want-to-read': 'Ingin Dibaca',
  'currently-reading': 'Sedang Dibaca',
  read: 'Sudah Dibaca',
};

const formatDateId = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const ReviewsPage: React.FC = () => {
  const {
    books,
    reviews,
    loans,
    currentMember,
    selectedBookId,
    openBookReview,
    borrowBook,
    getShelfStatus,
    setShelfStatus,
    submitReview,
    deleteReview,
    toggleHelpfulVote,
    getBookRatingStats,
    setActivePage,
  } = useLibrary();

  const [viewMode, setViewMode] = useState<'book-detail' | 'community-feed'>('book-detail');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [sortReviews, setSortReviews] = useState<'helpful' | 'newest'>('helpful');
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) ?? books[0],
    [books, selectedBookId]
  );

  const existingMemberReview = useMemo(() => {
    if (!currentMember || !selectedBook) return null;
    return (
      reviews.find(
        (r) => r.bookId === selectedBook.id && r.memberId === currentMember.id
      ) ?? null
    );
  }, [reviews, currentMember, selectedBook]);

  const [ratingInput, setRatingInput] = useState<number>(5);
  const [shelfInput, setShelfInput] = useState<ReadingShelfStatus>('read');
  const [commentInput, setCommentInput] = useState<string>('');
  const [spoilerInput, setSpoilerInput] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    if (existingMemberReview) {
      setRatingInput(existingMemberReview.rating);
      setShelfInput(existingMemberReview.shelfStatus);
      setCommentInput(existingMemberReview.comment);
      setSpoilerInput(existingMemberReview.hasSpoiler);
    } else {
      setRatingInput(0);
      setShelfInput(getShelfStatus(selectedBook.id) ?? 'read');
      setCommentInput('');
      setSpoilerInput(false);
    }
    setFormError('');
    setStarFilter('all');
  }, [selectedBook.id, existingMemberReview]);

  const stats = getBookRatingStats(selectedBook.id);
  const currentShelf = getShelfStatus(selectedBook.id);

  const isBorrowedByMember = Boolean(
    currentMember &&
      loans.some(
        (l) =>
          l.bookId === selectedBook.id &&
          l.memberId === currentMember.id &&
          l.status === 'active'
      )
  );

  const bookReviews = useMemo(() => {
    const filtered = reviews.filter((r) => {
      if (r.bookId !== selectedBook.id) return false;
      if (starFilter !== 'all' && Math.round(r.rating) !== starFilter) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortReviews === 'helpful') {
        return b.helpfulMemberIds.length - a.helpfulMemberIds.length;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, selectedBook.id, starFilter, sortReviews]);

  const allFeedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reviews]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const result = submitReview(
      selectedBook.id,
      ratingInput,
      shelfInput,
      commentInput,
      spoilerInput
    );
    if (!result.ok && result.error) {
      setFormError(result.error);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header & View Switcher */}
      <div className="flex flex-col gap-4 border-b border-amber-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-sky-800">Komunitas Pembaca Kala</p>
          <h1 className="font-editorial text-3xl font-semibold text-slate-900 sm:text-4xl mt-1">
            Ulasan & Rak Baca Buku
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-700">
            Lihat distribusi rating komunitas, kelola status rak baca Anda, dan tulis ulasan mendalam untuk membantu pembaca lain di Kala.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-sky-100/60 p-1 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('book-detail')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'book-detail'
                ? 'bg-yellow-50 text-sky-900 shadow-sm'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Halaman Buku & Ulasan
          </button>
          <button
            type="button"
            onClick={() => setViewMode('community-feed')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'community-feed'
                ? 'bg-yellow-50 text-sky-900 shadow-sm'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Linimasa Komunitas ({reviews.length})
          </button>
        </div>
      </div>

      {/* Book Switcher Strip */}
      {viewMode === 'book-detail' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">Pilih Judul Buku:</p>
            <select
              aria-label="Pilih buku untuk melihat ulasan"
              value={selectedBook.id}
              onChange={(e) => openBookReview(e.target.value)}
              className="sm:hidden rounded-lg border border-amber-300 bg-yellow-100 px-3 py-1.5 text-xs font-medium text-slate-800"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-2">
            {books.map((b) => {
              const active = b.id === selectedBook.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => openBookReview(b.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-sky-600 text-white'
                      : 'border border-amber-200 bg-yellow-100/70 text-slate-800 hover:border-sky-300 hover:bg-sky-100'
                  }`}
                >
                  {b.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'book-detail' ? (
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Sticky Left Column: Cover + Goodreads Shelf + Borrow CTA + Full Metadata */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-5 rounded-2xl border border-amber-200 bg-yellow-100/60 p-5">
            <div className="mx-auto max-w-[240px]">
              <BookCover book={selectedBook} />
            </div>

            {/* Goodreads Shelf Selector */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-800">Status Rak Baca Anda</p>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-amber-200 bg-yellow-50 p-1">
                {(['want-to-read', 'currently-reading', 'read'] as ReadingShelfStatus[]).map(
                  (status) => {
                    const active = currentShelf === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setShelfStatus(selectedBook.id, active ? null : status)}
                        className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors text-center ${
                          active
                            ? 'bg-amber-300 text-slate-900 shadow-sm'
                            : 'text-slate-700 hover:bg-sky-100 hover:text-slate-900'
                        }`}
                      >
                        {SHELF_LABELS[status]}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Primary Borrow Action */}
            {isBorrowedByMember ? (
              <button
                type="button"
                onClick={() => setActivePage('borrow')}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-sky-300 bg-sky-100 px-4 py-2.5 text-sm font-semibold text-sky-900 hover:bg-sky-200"
              >
                <Check className="h-4 w-4" />
                Sedang Anda Pinjam · Kelola
              </button>
            ) : (
              <button
                type="button"
                disabled={selectedBook.availableCopies <= 0}
                onClick={() => borrowBook(selectedBook.id)}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  selectedBook.availableCopies > 0
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : 'bg-amber-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                {selectedBook.availableCopies > 0
                  ? 'Pinjam Buku Ini (14 Hari)'
                  : 'Semua Eksemplar Dipinjam'}
              </button>
            )}

            {/* Full Book Metadata */}
            <dl className="divide-y divide-amber-200/80 border-t border-amber-200 pt-2 text-xs">
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-slate-600 shrink-0">Judul</dt>
                <dd className="font-semibold text-slate-900 text-right">{selectedBook.title}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-slate-600 shrink-0">Penulis</dt>
                <dd className="font-medium text-slate-800 text-right">{selectedBook.author}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-slate-600 shrink-0">Subjek</dt>
                <dd className="text-slate-800 text-right">{selectedBook.subject}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-slate-600 shrink-0">Format</dt>
                <dd className="font-mono text-slate-800 text-right">{selectedBook.format}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-slate-600 shrink-0">Hak Akses</dt>
                <dd className="font-semibold text-sky-800 text-right">{selectedBook.accessRights}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-slate-600 shrink-0">ISBN</dt>
                <dd className="font-mono font-medium text-slate-800 tabular-nums text-right">
                  {selectedBook.isbn}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-slate-600 shrink-0">Ketersediaan</dt>
                <dd className="font-mono font-medium text-sky-800 tabular-nums text-right">
                  {selectedBook.availableCopies} dari {selectedBook.totalCopies} unit
                </dd>
              </div>
            </dl>
          </aside>

          {/* Right Column: Synopsis, Rating Distribution, Review Composer, Reviews List */}
          <div className="lg:col-span-8 space-y-8">
            {/* Book Synopsis Header */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-sky-800">{selectedBook.category}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedBook.language}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{selectedBook.callNumber}</span>
              </div>

              <h2 className="font-editorial text-3xl font-semibold text-slate-900">
                {selectedBook.title}
              </h2>
              <p className="text-base font-medium text-slate-700">oleh {selectedBook.author}</p>

              <p className="pt-2 text-sm leading-relaxed text-slate-700 max-w-2xl">
                {selectedBook.synopsis}
              </p>
            </section>

            {/* Goodreads Rating Breakdown */}
            <section className="rounded-2xl border border-sky-200 bg-sky-100/60 p-6">
              <div className="grid gap-6 sm:grid-cols-12 sm:items-center">
                <div className="sm:col-span-4 space-y-1.5 border-b border-sky-200 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
                  <p className="text-xs font-medium text-slate-600">Rating Komunitas</p>
                  <p className="font-mono text-4xl font-semibold text-slate-900 tabular-nums">
                    {stats.average > 0 ? stats.average.toFixed(2) : '0.00'}
                  </p>
                  <StarDisplay rating={stats.average} size="md" />
                  <p className="text-xs text-slate-600 tabular-nums pt-0.5">
                    Berdasarkan {stats.total} ulasan pembaca
                  </p>
                </div>

                {/* 5-to-1 Distribution Bars */}
                <div className="sm:col-span-8 space-y-2">
                  {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = stats.distribution[star];
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    const isSelectedFilter = starFilter === star;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setStarFilter((prev) => (prev === star ? 'all' : star))
                        }
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-1 text-xs transition-colors ${
                          isSelectedFilter ? 'bg-amber-200/90' : 'hover:bg-yellow-50/80'
                        }`}
                      >
                        <span className="w-16 text-left font-medium text-slate-800 tabular-nums shrink-0">
                          {star} bintang
                        </span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-yellow-50 border border-sky-200">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right font-mono text-slate-700 tabular-nums shrink-0">
                          {count} ({pct}%)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Review Composer */}
            <section className="rounded-2xl border border-amber-200 bg-yellow-100/55 p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-editorial text-xl font-semibold text-slate-900">
                    {existingMemberReview ? 'Perbarui Ulasan Anda' : 'Tulis Ulasan Anda'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Bagikan kesan membaca Anda seperti di Goodreads untuk pembaca lain.
                  </p>
                </div>
                {existingMemberReview && (
                  <button
                    type="button"
                    onClick={() => deleteReview(existingMemberReview.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                )}
              </div>

              {!currentMember ? (
                <div className="flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-100/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-800">
                    Masuk sebagai anggota Kala untuk memberikan rating bintang dan menulis ulasan buku ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActivePage('login')}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 whitespace-nowrap shrink-0"
                  >
                    Masuk Anggota
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="block text-xs font-semibold text-slate-800">
                      Rating Anda
                    </span>
                    <StarPicker value={ratingInput} onChange={setRatingInput} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="review-shelf"
                        className="block text-xs font-semibold text-slate-800 mb-1.5"
                      >
                        Status Rak Baca
                      </label>
                      <select
                        id="review-shelf"
                        value={shelfInput}
                        onChange={(e) => setShelfInput(e.target.value as ReadingShelfStatus)}
                        className="h-10 w-full rounded-lg border border-amber-300 bg-yellow-50 px-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                      >
                        <option value="read">Sudah Dibaca</option>
                        <option value="currently-reading">Sedang Dibaca</option>
                        <option value="want-to-read">Ingin Dibaca</option>
                      </select>
                    </div>

                    <div className="flex items-end pb-2">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={spoilerInput}
                          onChange={(e) => setSpoilerInput(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-400 text-sky-600 focus:ring-sky-600"
                        />
                        Tandai ulasan ini mengandung spoiler cerita
                      </label>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="review-comment"
                      className="block text-xs font-semibold text-slate-800 mb-1.5"
                    >
                      Ulasan Pembaca
                    </label>
                    <textarea
                      id="review-comment"
                      rows={4}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Apa yang paling berkesan dari buku ini? Bagaimana gaya bahasanya atau pesan utamanya?"
                      className="w-full rounded-lg border border-amber-300 bg-yellow-50 p-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                    />
                  </div>

                  {formError && (
                    <p className="text-xs font-medium text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {formError}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-600 font-mono tabular-nums">
                      {commentInput.trim().length} karakter (min. 10)
                    </span>
                    <button
                      type="submit"
                      className="rounded-lg bg-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors"
                    >
                      {existingMemberReview ? 'Simpan Perubahan Ulasan' : 'Publikasikan Ulasan'}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Community Reviews List */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-sky-800" aria-hidden="true" />
                  <h3 className="font-editorial text-xl font-semibold text-slate-900">
                    Ulasan Pembaca ({bookReviews.length})
                  </h3>
                  {starFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setStarFilter('all')}
                      className="ml-2 text-xs font-medium text-sky-800 underline"
                    >
                      Tampilkan semua bintang
                    </button>
                  )}
                </div>

                <select
                  aria-label="Urutkan ulasan"
                  value={sortReviews}
                  onChange={(e) => setSortReviews(e.target.value as 'helpful' | 'newest')}
                  className="rounded-lg border border-amber-300 bg-yellow-100 px-3 py-1.5 text-xs font-medium text-slate-800"
                >
                  <option value="helpful">Paling Membantu</option>
                  <option value="newest">Terbaru</option>
                </select>
              </div>

              {bookReviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-amber-300 bg-yellow-100/50 p-8 text-center">
                  <p className="text-sm font-medium text-slate-800">
                    Belum ada ulasan untuk filter bintang ini.
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Jadilah pembaca pertama yang membagikan ulasan!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookReviews.map((rev) => {
                    const initials = rev.memberName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    const isHelpful =
                      currentMember && rev.helpfulMemberIds.includes(currentMember.id);
                    const spoilerHidden = rev.hasSpoiler && !revealedSpoilers[rev.id];

                    return (
                      <article
                        key={rev.id}
                        className="rounded-xl border border-amber-200 bg-yellow-100/50 p-5 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-200 text-xs font-semibold text-sky-950">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {rev.memberName}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <span>{SHELF_LABELS[rev.shelfStatus]}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  {formatDateId(rev.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <StarDisplay rating={rev.rating} size="md" />
                        </div>

                        {spoilerHidden ? (
                          <div className="rounded-lg border border-amber-300 bg-amber-200/70 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-900">
                              <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                              <span>Ulasan ini ditandai mengandung spoiler cerita.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setRevealedSpoilers((prev) => ({ ...prev, [rev.id]: true }))
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-amber-100 self-start sm:self-auto"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Tampilkan Ulasan
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed text-slate-800">{rev.comment}</p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-amber-200/80">
                          <button
                            type="button"
                            onClick={() => toggleHelpfulVote(rev.id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                              isHelpful
                                ? 'border-sky-300 bg-sky-100 text-sky-900'
                                : 'border-amber-300 bg-yellow-50 text-slate-700 hover:bg-sky-50'
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>Membantu</span>
                            <span className="font-mono tabular-nums">
                              ({rev.helpfulMemberIds.length})
                            </span>
                          </button>

                          {rev.hasSpoiler && !spoilerHidden && (
                            <span className="text-[11px] font-medium text-amber-800">
                              Mengandung spoiler
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : (
        /* Community Review Feed View */
        <section className="space-y-4">
          {allFeedReviews.map((rev) => {
            const book = books.find((b) => b.id === rev.bookId);
            if (!book) return null;
            const isHelpful =
              currentMember && rev.helpfulMemberIds.includes(currentMember.id);

            return (
              <article
                key={rev.id}
                className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-yellow-100/55 p-5 sm:flex-row"
              >
                <button
                  type="button"
                  onClick={() => {
                    openBookReview(book.id);
                    setViewMode('book-detail');
                  }}
                  className="w-20 shrink-0 text-left rounded-lg"
                >
                  <BookCover book={book} />
                </button>

                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{rev.memberName}</span>
                      {' · '}
                      <span>{SHELF_LABELS[rev.shelfStatus]}</span>
                      {' · '}
                      <span className="font-mono tabular-nums">{formatDateId(rev.createdAt)}</span>
                    </div>
                    <StarDisplay rating={rev.rating} />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        openBookReview(book.id);
                        setViewMode('book-detail');
                      }}
                      className="font-editorial text-lg font-semibold text-slate-900 hover:text-sky-800 text-left"
                    >
                      {book.title}
                    </button>
                    <p className="text-xs text-slate-600">{book.author}</p>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-800">{rev.comment}</p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => toggleHelpfulVote(rev.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        isHelpful
                          ? 'border-sky-300 bg-sky-100 text-sky-900'
                          : 'border-amber-300 bg-yellow-50 text-slate-700 hover:bg-sky-50'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>Membantu ({rev.helpfulMemberIds.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openBookReview(book.id);
                        setViewMode('book-detail');
                      }}
                      className="text-xs font-semibold text-sky-800 hover:text-sky-950"
                    >
                      Buka Halaman Buku
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};
