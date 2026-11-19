import React, { useState } from 'react';
import { api } from '../../services/api';
import { StarRating } from './StarRating';
import { X, Send, AlertTriangle, ThumbsUp } from 'lucide-react';

export const ReviewModal = ({ booking, isOpen, onClose, onReviewSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const quickTags = ['On Time & Polite', 'Fair Transparent Charges', 'Expert Work Quality', 'Cleaned Up After Work'];

  const handleTagClick = (tag) => {
    if (!comment.includes(tag)) {
      setComment(comment ? `${comment}. ${tag}` : tag);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.reviews.add({
        bookingId: booking.id,
        rating,
        comment,
      });
      setLoading(false);
      onReviewSuccess(res.data);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to submit review');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Rate Your Service</h3>
            <p className="text-xs text-slate-500">Service by {booking.workerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Star selector */}
          <div className="text-center py-2">
            <p className="text-xs text-slate-500 mb-2 font-medium">How would you rate the experience?</p>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                totalStars={5}
                size="w-8 h-8"
                interactive={true}
                onRatingChange={setRating}
              />
            </div>
            <p className="text-xs font-bold text-amber-600 mt-2">
              {rating === 5 ? 'Excellent & Professional!' : rating === 4 ? 'Very Good Service' : rating === 3 ? 'Average' : 'Needs Improvement'}
            </p>
          </div>

          {/* Quick tags */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">Quick Highlights</p>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200 hover:border-brand-500 hover:bg-brand-50 text-slate-600 transition"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Review comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Review / Feedback
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Tell others about the punctuality, pricing transparency, and service quality..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/30 transition hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

