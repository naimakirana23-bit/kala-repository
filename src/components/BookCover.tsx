import React, { useState } from 'react';
import { Book } from '../types/library';

interface BookCoverProps {
  book: Book;
  className?: string;
}

const renderMotifSvg = (book: Book) => {
  const primary = book.coverAccent === 'sky' ? '#38BDF8' : '#FACC15';
  const secondary = book.coverAccent === 'sky' ? '#FACC15' : '#38BDF8';
  const softWash = book.coverAccent === 'sky' ? '#E0F2FE' : '#FEF08A';

  switch (book.coverMotif) {
    case 'horizon':
      return (
        <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
          <rect width="180" height="180" fill="#FEFCE8" />
          <circle cx="124" cy="54" r="24" fill={secondary} />
          <path d="M0 118 Q48 84 96 112 T180 104 L180 180 L0 180 Z" fill={primary} opacity="0.85" />
          <path d="M0 138 Q65 118 125 138 T180 132 L180 180 L0 180 Z" fill={softWash} />
        </svg>
      );
    case 'arches':
      return (
        <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
          <rect width="180" height="180" fill="#FEFCE8" />
          <path d="M36 165 V82 A54 54 0 0 1 144 82 V165" fill="none" stroke={primary} strokeWidth="14" />
          <path d="M58 165 V86 A32 32 0 0 1 122 86 V165" fill="none" stroke={softWash} strokeWidth="10" />
          <polygon points="88,165 138,165 124,94" fill={secondary} opacity="0.92" />
        </svg>
      );
    case 'waves':
      return (
        <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
          <rect width="180" height="180" fill="#FEFCE8" />
          <circle cx="90" cy="48" r="18" fill={secondary} />
          <path d="M0 108 C36 90 66 122 108 102 C142 86 162 106 180 98 V180 H0 Z" fill={softWash} />
          <path d="M0 128 C44 110 82 142 128 122 C152 112 166 126 180 120 V180 H0 Z" fill={primary} opacity="0.8" />
          <path d="M0 150 C50 138 98 160 180 144 V180 H0 Z" fill="#0284C7" opacity="0.7" />
        </svg>
      );
    case 'orbit':
      return (
        <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
          <rect width="180" height="180" fill="#FEFCE8" />
          <circle cx="90" cy="90" r="64" fill="none" stroke={softWash} strokeWidth="2" />
          <circle cx="90" cy="90" r="44" fill="none" stroke={primary} strokeWidth="2.5" />
          <circle cx="90" cy="90" r="16" fill={secondary} />
          <circle cx="134" cy="90" r="6" fill={primary} />
          <circle cx="46" cy="52" r="5" fill={secondary} />
          <circle cx="122" cy="142" r="4.5" fill="#0284C7" />
        </svg>
      );
    case 'sunburst':
      return (
        <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
          <rect width="180" height="180" fill="#FEFCE8" />
          <circle cx="90" cy="92" r="56" fill={softWash} />
          <circle cx="90" cy="92" r="34" fill={secondary} />
          <line x1="20" y1="146" x2="160" y2="146" stroke={primary} strokeWidth="4" />
          <line x1="42" y1="158" x2="138" y2="158" stroke={primary} strokeWidth="2" />
        </svg>
      );
    case 'grid':
      return (
        <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
          <rect width="180" height="180" fill="#FEFCE8" />
          <rect x="26" y="26" width="56" height="56" rx="4" fill={softWash} />
          <rect x="96" y="26" width="58" height="56" rx="4" fill={primary} opacity="0.85" />
          <rect x="26" y="96" width="56" height="58" rx="4" fill={secondary} />
          <rect x="96" y="96" width="58" height="58" rx="4" fill="#E0F2FE" stroke={primary} strokeWidth="2" />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
          <rect width="180" height="180" fill="#FEFCE8" />
          <circle cx="90" cy="90" r="58" fill={softWash} />
          <polygon points="90,34 106,90 90,104 74,90" fill={primary} />
          <polygon points="90,146 106,90 90,76 74,90" fill={secondary} />
          <circle cx="90" cy="90" r="6" fill="#0F172A" />
        </svg>
      );
    case 'columns':
    default:
      return (
        <svg viewBox="0 0 180 180" className="w-full h-full" aria-hidden="true">
          <rect width="180" height="180" fill="#FEFCE8" />
          <rect x="30" y="34" width="24" height="114" rx="2" fill={softWash} />
          <rect x="64" y="54" width="24" height="94" rx="2" fill={primary} opacity="0.85" />
          <rect x="98" y="26" width="24" height="122" rx="2" fill={secondary} />
          <rect x="132" y="70" width="20" height="78" rx="2" fill="#BAE6FD" />
        </svg>
      );
  }
};

export const BookCover: React.FC<BookCoverProps> = ({ book, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (book.coverImage && !imgFailed) {
    return (
      <div
        className={`relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-amber-200 bg-yellow-100 ${className}`}
      >
        <img
          src={book.coverImage}
          alt={`Sampul buku ${book.title}`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-amber-200 bg-yellow-50 flex flex-col justify-between p-4 ${className}`}
    >
      <div className="space-y-1">
        <p className="text-[10px] font-medium tracking-wide text-sky-700 truncate">
          {book.category}
        </p>
        <h4 className="font-editorial text-sm font-semibold leading-snug text-slate-900 line-clamp-3">
          {book.title}
        </h4>
        <p className="text-[11px] text-slate-600 truncate">{book.author}</p>
      </div>
      <div className="my-2 aspect-square w-full overflow-hidden rounded-md border border-amber-200/80">
        {renderMotifSvg(book)}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 tabular-nums">
        <span>{book.year}</span>
        <span>KALA</span>
      </div>
    </div>
  );
};
