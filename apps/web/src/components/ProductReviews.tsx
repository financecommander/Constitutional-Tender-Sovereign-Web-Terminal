'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
}

interface ReviewSummary {
  avgRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

interface ProductReviewsProps {
  sku: string;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= rating ? 'text-gold-400' : 'text-navy-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function InteractiveStarRating({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <svg
            className={`w-6 h-6 transition-colors ${
              star <= (hover || rating) ? 'text-gold-400' : 'text-navy-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ sku }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${sku}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setSummary(data.summary || null);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [sku]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${sku}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ rating: 5, title: '', body: '' });
        fetchReviews();
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-navy-800 border border-navy-700 rounded-lg p-5 animate-pulse h-32" />
    );
  }

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">
          Customer Reviews
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Summary */}
      {summary && summary.totalReviews > 0 && (
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-navy-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{summary.avgRating.toFixed(1)}</div>
            <StarRating rating={Math.round(summary.avgRating)} size="lg" />
            <p className="text-xs text-navy-400 mt-1">{summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const pct = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="text-navy-400 w-3">{star}</span>
                  <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-navy-500 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={submitReview} className="mb-4 pb-4 border-b border-navy-700 space-y-3">
          <div>
            <label className="block text-xs text-navy-400 mb-1">Rating</label>
            <InteractiveStarRating rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
          </div>
          <div>
            <label className="block text-xs text-navy-400 mb-1">Title (optional)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Summarize your experience"
              className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-navy-400 mb-1">Review (optional)</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Share details about your experience..."
              rows={3}
              className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-navy-400 text-sm text-center py-4">No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-navy-700/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  {review.isVerified && (
                    <span className="text-xs text-green-400 flex items-center gap-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <span className="text-xs text-navy-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.title && (
                <p className="text-white text-sm font-medium mt-1">{review.title}</p>
              )}
              {review.body && (
                <p className="text-navy-300 text-sm mt-1">{review.body}</p>
              )}
              <p className="text-xs text-navy-500 mt-1">
                {review.user.name || review.user.email.split('@')[0]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
