export type BookCategory =
  | 'Sastra'
  | 'Desain & Arsitektur'
  | 'Sains & Teknologi'
  | 'Sejarah & Budaya'
  | 'Pengembangan Diri';

export type ReadingShelfStatus = 'want-to-read' | 'currently-reading' | 'read';

export type PageView = 'home' | 'collection' | 'borrow' | 'reviews' | 'login';

export type CoverMotif =
  | 'horizon'
  | 'arches'
  | 'waves'
  | 'orbit'
  | 'grid'
  | 'sunburst'
  | 'columns'
  | 'compass';

export interface Book {
  id: string;
  title: string;
  author: string;
  subject: string;
  format: string;
  accessRights: string;
  category: BookCategory;
  year: number;
  pages: number;
  publisher: string;
  isbn: string;
  callNumber: string;
  language: string;
  synopsis: string;
  coverImage?: string;
  coverMotif: CoverMotif;
  coverAccent: 'sky' | 'yellow';
  totalCopies: number;
  availableCopies: number;
  featured?: boolean;
  recommendedReason?: string;
}

export interface Member {
  id: string;
  memberCode: string;
  name: string;
  email: string;
  password: string;
  joinedAt: string;
  favoriteGenre: BookCategory;
  bio: string;
}

export interface LoanRecord {
  id: string;
  bookId: string;
  memberId: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: 'active' | 'returned';
  renewCount: number;
  readingProgress: number;
}

export interface BookReview {
  id: string;
  bookId: string;
  memberId: string;
  memberName: string;
  rating: number;
  shelfStatus: ReadingShelfStatus;
  comment: string;
  hasSpoiler: boolean;
  createdAt: string;
  helpfulMemberIds: string[];
}

export interface ShelfEntry {
  bookId: string;
  memberId: string;
  status: ReadingShelfStatus;
  updatedAt: string;
}
