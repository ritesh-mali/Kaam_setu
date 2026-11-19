import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating = 5, totalStars = 5, size = 'w-4 h-4', interactive = false, onRatingChange }) => {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = rating >= starValue;
        const isHalf = rating > index && rating < starValue;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              className={`${size} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-200 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

