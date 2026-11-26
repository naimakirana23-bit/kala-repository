import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_BOOKS,
  INITIAL_LOANS,
  INITIAL_MEMBERS,
  INITIAL_REVIEWS,
  INITIAL_SHELVES,
} from '../data/catalog';
import {
  Book,
  BookCategory,
  BookReview,
  LoanRecord,
  Member,
  PageView,
  ReadingShelfStatus,
  ShelfEntry,
} from '../types/library';

const STORAGE_KEY = 'kala_library_state_v2';

interface PersistedState {
  books: Book[];
  members: Member[];
  currentMemberId: string | null;
  loans: LoanRecord[];
  reviews: BookReview[];
  shelves: ShelfEntry[];
}

export interface ToastNotice {
  id: string;
  message: string;
  tone: 'sky' | 'yellow' | 'error';
}

interface LibraryContextValue {
  books: Book[];
  members: Member[];
  currentMember: Member | null;
  loans: LoanRecord[];
  reviews: BookReview[];
  shelves: ShelfEntry[];
  activePage: PageView;
  selectedBookId: string;
  toast: ToastNotice | null;
  setActivePage: (page: PageView) => void;
  openBookReview: (bookId: string) => void;
  dismissToast: () => void;
  loginMember: (email: string, password: string) => { ok: boolean; error?: string };
  loginDemoMember: (memberId: string) => void;
  registerMember: (
    name: string,
    email: string,
    password: string,
    favoriteGenre: BookCategory
  ) => { ok: boolean; error?: string };
  logoutMember: () => void;
  borrowBook: (bookId: string) => { ok: boolean; error?: string };
  returnBook: (loanId: string) => void;
  renewLoan: (loanId: string) => { ok: boolean; error?: string };
  updateLoanProgress: (loanId: string, progress: number) => void;
  setShelfStatus: (bookId: string, status: ReadingShelfStatus | null) => void;
  getShelfStatus: (bookId: string) => ReadingShelfStatus | null;
  submitReview: (
    bookId: string,
    rating: number,
    shelfStatus: ReadingShelfStatus,
    comment: string,
    hasSpoiler: boolean
  ) => { ok: boolean; error?: string };
  deleteReview: (reviewId: string) => void;
  toggleHelpfulVote: (reviewId: string) => void;
  getBookRatingStats: (bookId: string) => {
    average: number;
    total: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  };
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

const mergeBooksWithMetadata = (storedBooks: Book[]): Book[] => {
  return storedBooks.map((book) => {
    const seed = INITIAL_BOOKS.find((b) => b.id === book.id);
    if (!seed) return book;
    return {
      ...seed,
      ...book,
      subject: book.subject || seed.subject,
      format: book.format || seed.format,
      accessRights: book.accessRights || seed.accessRights,
    };
  });
};

const loadInitialState = (): PersistedState => {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (
          Array.isArray(parsed.books) &&
          Array.isArray(parsed.members) &&
          Array.isArray(parsed.loans) &&
          Array.isArray(parsed.reviews) &&
          Array.isArray(parsed.shelves)
        ) {
          return {
            books: mergeBooksWithMetadata(parsed.books),
            members: parsed.members,
            currentMemberId: parsed.currentMemberId ?? null,
            loans: parsed.loans,
            reviews: parsed.reviews,
            shelves: parsed.shelves,
          };
        }
      }
    } catch {
      // Fallback to default seed data if storage is unavailable or corrupted
    }
  }

  return {
    books: INITIAL_BOOKS,
    members: INITIAL_MEMBERS,
    currentMemberId: null,
    loans: INITIAL_LOANS,
    reviews: INITIAL_REVIEWS,
    shelves: INITIAL_SHELVES,
  };
};

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [activePage, setActivePage] = useState<PageView>('home');
  const [selectedBookId, setSelectedBookId] = useState<string>(INITIAL_BOOKS[0].id);
  const [toast, setToast] = useState<ToastNotice | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues
    }
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, tone: ToastNotice['tone'] = 'sky') => {
    setToast({ id: String(Date.now()), message, tone });
  };

  const currentMember = useMemo(
    () => state.members.find((m) => m.id === state.currentMemberId) ?? null,
    [state.members, state.currentMemberId]
  );

  const openBookReview = (bookId: string) => {
    setSelectedBookId(bookId);
    setActivePage('reviews');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigatePage = (page: PageView) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginMember = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = state.members.find(
      (m) => m.email.toLowerCase() === normalizedEmail && m.password === password
    );
    if (!found) {
      return { ok: false, error: 'Email atau kata sandi anggota tidak cocok.' };
    }
    setState((prev) => ({ ...prev, currentMemberId: found.id }));
    showToast(`Selamat datang kembali di Kala, ${found.name}.`, 'sky');
    return { ok: true };
  };

  const loginDemoMember = (memberId: string) => {
    const found = state.members.find((m) => m.id === memberId);
    if (!found) return;
    setState((prev) => ({ ...prev, currentMemberId: found.id }));
    showToast(`Masuk sebagai anggota demo Kala: ${found.name}.`, 'sky');
  };

  const registerMember = (
    name: string,
    email: string,
    password: string,
    favoriteGenre: BookCategory
  ) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 3) {
      return { ok: false, error: 'Nama lengkap minimal 3 karakter.' };
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { ok: false, error: 'Masukkan alamat email yang valid.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Kata sandi minimal 6 karakter.' };
    }
    if (state.members.some((m) => m.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'Email ini sudah terdaftar sebagai anggota.' };
    }

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      memberCode: `KALA-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      name: cleanName,
      email: cleanEmail,
      password,
      joinedAt: new Date().toISOString().slice(0, 10),
      favoriteGenre,
      bio: `Anggota Perpustakaan Kala · Gemar membaca kategori ${favoriteGenre}.`,
    };

    setState((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
      currentMemberId: newMember.id,
    }));
    showToast(`Pendaftaran berhasil. Kartu anggota ${newMember.memberCode} telah aktif.`, 'yellow');
    return { ok: true };
  };

  const logoutMember = () => {
    setState((prev) => ({ ...prev, currentMemberId: null }));
    showToast('Anda telah keluar dari akun anggota Kala.', 'sky');
  };

  const borrowBook = (bookId: string) => {
    if (!currentMember) {
      showToast('Silakan masuk sebagai anggota terlebih dahulu untuk meminjam buku.', 'yellow');
      navigatePage('login');
      return { ok: false, error: 'Belum masuk sebagai anggota.' };
    }

    const book = state.books.find((b) => b.id === bookId);
    if (!book) {
      return { ok: false, error: 'Buku tidak ditemukan.' };
    }

    const memberActiveLoans = state.loans.filter(
      (l) => l.memberId === currentMember.id && l.status === 'active'
    );

    if (memberActiveLoans.some((l) => l.bookId === bookId)) {
      showToast('Anda sedang meminjam buku ini.', 'yellow');
      return { ok: false, error: 'Buku ini sudah ada dalam daftar pinjaman aktif Anda.' };
    }

    if (memberActiveLoans.length >= 3) {
      showToast('Batas maksimal 3 buku aktif tercapai. Kembalikan satu buku terlebih dahulu.', 'error');
      return { ok: false, error: 'Maksimal 3 peminjaman aktif per anggota.' };
    }

    if (book.availableCopies <= 0) {
      showToast('Maaf, seluruh eksemplar buku ini sedang dipinjam.', 'error');
      return { ok: false, error: 'Stok buku sedang kosong.' };
    }

    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + 14);

    const newLoan: LoanRecord = {
      id: `loan-${Date.now()}`,
      bookId: book.id,
      memberId: currentMember.id,
      borrowedAt: now.toISOString(),
      dueAt: due.toISOString(),
      status: 'active',
      renewCount: 0,
      readingProgress: 0,
    };

    setState((prev) => {
      const updatedBooks = prev.books.map((b) =>
        b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b
      );
      const existingShelf = prev.shelves.find(
        (s) => s.bookId === bookId && s.memberId === currentMember.id
      );
      const updatedShelves = existingShelf
        ? prev.shelves.map((s) =>
            s.bookId === bookId && s.memberId === currentMember.id
              ? { ...s, status: 'currently-reading' as const, updatedAt: now.toISOString() }
              : s
          )
        : [
            ...prev.shelves,
            {
              bookId,
              memberId: currentMember.id,
              status: 'currently-reading' as const,
              updatedAt: now.toISOString(),
            },
          ];

      return {
        ...prev,
        books: updatedBooks,
        loans: [newLoan, ...prev.loans],
        shelves: updatedShelves,
      };
    });

    showToast(`Berhasil meminjam "${book.title}". Batas kembali 14 hari.`, 'sky');
    return { ok: true };
  };

  const returnBook = (loanId: string) => {
    const targetLoan = state.loans.find((l) => l.id === loanId && l.status === 'active');
    if (!targetLoan) return;

    const book = state.books.find((b) => b.id === targetLoan.bookId);
    const nowIso = new Date().toISOString();

    setState((prev) => {
      const updatedLoans = prev.loans.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'returned' as const,
              returnedAt: nowIso,
              readingProgress: 100,
            }
          : l
      );
      const updatedBooks = prev.books.map((b) =>
        b.id === targetLoan.bookId
          ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
          : b
      );
      const updatedShelves = prev.shelves.map((s) =>
        s.bookId === targetLoan.bookId && s.memberId === targetLoan.memberId
          ? { ...s, status: 'read' as const, updatedAt: nowIso }
          : s
      );

      return {
        ...prev,
        loans: updatedLoans,
        books: updatedBooks,
        shelves: updatedShelves,
      };
    });

    showToast(
      `Buku "${book?.title ?? 'Pilihan'}" berhasil dikembalikan ke Kala.`,
      'yellow'
    );
  };

  const renewLoan = (loanId: string) => {
    const targetLoan = state.loans.find((l) => l.id === loanId && l.status === 'active');
    if (!targetLoan) {
      return { ok: false, error: 'Pinjaman tidak ditemukan.' };
    }
    if (targetLoan.renewCount >= 1) {
      showToast('Perpanjangan hanya tersedia 1 kali per masa pinjam.', 'error');
      return { ok: false, error: 'Batas perpanjangan tercapai.' };
    }

    const nextDue = new Date(targetLoan.dueAt);
    nextDue.setDate(nextDue.getDate() + 7);

    setState((prev) => ({
      ...prev,
      loans: prev.loans.map((l) =>
        l.id === loanId
          ? { ...l, dueAt: nextDue.toISOString(), renewCount: l.renewCount + 1 }
          : l
      ),
    }));

    showToast('Masa pinjam berhasil diperpanjang 7 hari.', 'sky');
    return { ok: true };
  };

  const updateLoanProgress = (loanId: string, progress: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(progress)));
    setState((prev) => ({
      ...prev,
      loans: prev.loans.map((l) => (l.id === loanId ? { ...l, readingProgress: clamped } : l)),
    }));
  };

  const getShelfStatus = (bookId: string): ReadingShelfStatus | null => {
    if (!currentMember) return null;
    return (
      state.shelves.find((s) => s.bookId === bookId && s.memberId === currentMember.id)?.status ??
      null
    );
  };

  const setShelfStatus = (bookId: string, status: ReadingShelfStatus | null) => {
    if (!currentMember) {
      showToast('Masuk sebagai anggota untuk menyimpan buku ke rak baca Anda.', 'yellow');
      navigatePage('login');
      return;
    }

    const nowIso = new Date().toISOString();
    setState((prev) => {
      const filtered = prev.shelves.filter(
        (s) => !(s.bookId === bookId && s.memberId === currentMember.id)
      );
      if (!status) {
        return { ...prev, shelves: filtered };
      }
      return {
        ...prev,
        shelves: [
          ...filtered,
          { bookId, memberId: currentMember.id, status, updatedAt: nowIso },
        ],
      };
    });

    const labels: Record<ReadingShelfStatus, string> = {
      'want-to-read': 'Ingin Dibaca',
      'currently-reading': 'Sedang Dibaca',
      read: 'Sudah Dibaca',
    };
    showToast(
      status ? `Buku disimpan ke rak "${labels[status]}".` : 'Buku dihapus dari rak baca Anda.',
      'sky'
    );
  };

  const submitReview = (
    bookId: string,
    rating: number,
    shelfStatus: ReadingShelfStatus,
    comment: string,
    hasSpoiler: boolean
  ) => {
    if (!currentMember) {
      navigatePage('login');
      return { ok: false, error: 'Silakan masuk terlebih dahulu untuk menulis ulasan.' };
    }
    if (rating < 1 || rating > 5) {
      return { ok: false, error: 'Pilih rating antara 1 hingga 5 bintang.' };
    }
    const cleanComment = comment.trim();
    if (cleanComment.length < 10) {
      return { ok: false, error: 'Tulis ulasan minimal 10 karakter agar bermanfaat bagi pembaca lain.' };
    }

    const nowIso = new Date().toISOString();

    setState((prev) => {
      const existingReview = prev.reviews.find(
        (r) => r.bookId === bookId && r.memberId === currentMember.id
      );
      const updatedReviews = existingReview
        ? prev.reviews.map((r) =>
            r.id === existingReview.id
              ? {
                  ...r,
                  rating,
                  shelfStatus,
                  comment: cleanComment,
                  hasSpoiler,
                  createdAt: nowIso,
                }
              : r
          )
        : [
            {
              id: `rev-${Date.now()}`,
              bookId,
              memberId: currentMember.id,
              memberName: currentMember.name,
              rating,
              shelfStatus,
              comment: cleanComment,
              hasSpoiler,
              createdAt: nowIso,
              helpfulMemberIds: [],
            },
            ...prev.reviews,
          ];

      const filteredShelves = prev.shelves.filter(
        (s) => !(s.bookId === bookId && s.memberId === currentMember.id)
      );

      return {
        ...prev,
        reviews: updatedReviews,
        shelves: [
          ...filteredShelves,
          { bookId, memberId: currentMember.id, status: shelfStatus, updatedAt: nowIso },
        ],
      };
    });

    showToast('Ulasan Anda telah dipublikasikan.', 'yellow');
    return { ok: true };
  };

  const deleteReview = (reviewId: string) => {
    if (!currentMember) return;
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.filter(
        (r) => !(r.id === reviewId && r.memberId === currentMember.id)
      ),
    }));
    showToast('Ulasan Anda telah dihapus.', 'sky');
  };

  const toggleHelpfulVote = (reviewId: string) => {
    if (!currentMember) {
      showToast('Masuk sebagai anggota untuk menyukai ulasan.', 'yellow');
      return;
    }

    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) => {
        if (r.id !== reviewId) return r;
        const alreadyVoted = r.helpfulMemberIds.includes(currentMember.id);
        return {
          ...r,
          helpfulMemberIds: alreadyVoted
            ? r.helpfulMemberIds.filter((id) => id !== currentMember.id)
            : [...r.helpfulMemberIds, currentMember.id],
        };
      }),
    }));
  };

  const getBookRatingStats = (bookId: string) => {
    const bookReviews = state.reviews.filter((r) => r.bookId === bookId);
    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (bookReviews.length === 0) {
      return { average: 0, total: 0, distribution };
    }
    let sum = 0;
    for (const rev of bookReviews) {
      const star = Math.min(5, Math.max(1, Math.round(rev.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[star] += 1;
      sum += rev.rating;
    }
    return {
      average: Number((sum / bookReviews.length).toFixed(2)),
      total: bookReviews.length,
      distribution,
    };
  };

  return (
    <LibraryContext.Provider
      value={{
        books: state.books,
        members: state.members,
        currentMember,
        loans: state.loans,
        reviews: state.reviews,
        shelves: state.shelves,
        activePage,
        selectedBookId,
        toast,
        setActivePage: navigatePage,
        openBookReview,
        dismissToast: () => setToast(null),
        loginMember,
        loginDemoMember,
        registerMember,
        logoutMember,
        borrowBook,
        returnBook,
        renewLoan,
        updateLoanProgress,
        setShelfStatus,
        getShelfStatus,
        submitReview,
        deleteReview,
        toggleHelpfulVote,
        getBookRatingStats,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary harus digunakan di dalam LibraryProvider');
  }
  return ctx;
};
