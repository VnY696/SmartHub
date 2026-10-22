import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, totalReviews, interactive = false, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {stars.map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= Math.round(rating) ? '#F59E0B' : 'transparent'}
          color={star <= Math.round(rating) ? '#F59E0B' : '#4B5563'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'transform 0.1s' }}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
        />
      ))}
      {rating > 0 && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F3F4F6', marginLeft: '4px' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
      {totalReviews !== undefined && (
        <span style={{ fontSize: '0.8rem', color: '#9CA3AF', marginLeft: '2px' }}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default StarRating;
