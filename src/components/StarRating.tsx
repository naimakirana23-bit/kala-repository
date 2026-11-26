import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StarDisplay: React.FC<StarDisplayProps> = ({ rating, size = 'sm' }) => {
  const iconSize = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={`Rating ${rating.toFixed(1)} dari 5 bintang`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <Star
            key={star}
            className={`${iconSize} ${
              filled
                ? 'fill-amber-400 text-amber-500'
                : 'fill-yellow-100 text-amber-300'
            }`}
          />
        );
      })}
    </div>
  );
};

interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
}

export const StarPicker: React.FC<StarPickerProps> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState<number>(0);
  const activeValue = hovered || value;

  const labels = ['', 'Kurang Cocok', 'Cukup Baik', 'Bagus', 'Sangat Bagus', 'Luar Biasa'];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Pilih rating bintang">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= activeValue;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Beri ${star} bintang`}
              aria-checked={value === star}
              role="radio"
              className="p-1.5 rounded-md transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  active
                    ? 'fill-amber-400 text-amber-600'
                    : 'fill-yellow-50 text-amber-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {activeValue > 0 && (
        <span className="text-sm font-medium text-slate-800">
          {labels[activeValue]} ({activeValue}/5)
        </span>
      )}
    </div>
  );
};
