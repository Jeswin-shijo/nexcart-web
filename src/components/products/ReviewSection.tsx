import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductReviews, createReview } from '../../api/reviews.api';
import { useAuthStore } from '../../store/auth.store';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';

interface Review {
  _id: string;
  userId: { name: string };
  rating: number;
  title: string;
  body: string;
  isVerified?: boolean;
  createdAt: string;
}

function StarRow({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={interactive ? 24 : 14}
          className={
            s <= (interactive ? hovered || rating : rating)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }
          onClick={() => interactive && onChange?.(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={interactive ? { cursor: 'pointer' } : undefined}
        />
      ))}
    </div>
  );
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => getProductReviews(productId),
  });

  const reviews: Review[] = Array.isArray(data) ? data : data?.reviews ?? [];

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const mutation = useMutation({
    mutationFn: (payload: any) => createReview(payload),
    onSuccess: () => {
      toast.success('Review submitted!');
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setShowForm(false);
      setRating(0);
      setTitle('');
      setBody('');
    },
    onError: () => toast.error('Failed to submit review'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    mutation.mutate({ productId, rating, title, body, images: [] });
  }

  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRow rating={Math.round(avgRating)} />
              <span className="text-sm text-gray-500">
                {avgRating.toFixed(1)} out of 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
        {isAuthenticated && (
          <Button
            variant={showForm ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </Button>
        )}
      </div>

      {/* Review form */}
      {showForm && isAuthenticated && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
            <StarRow rating={rating} interactive onChange={setRating} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarise your experience"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell others what you think about this product..."
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-pink-500 resize-none"
              required
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Submitting…' : 'Submit Review'}
          </Button>
        </form>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <Spinner size="lg" className="py-10" />
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-sm py-6 text-center">
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {review.userId?.name ?? 'Anonymous'}
                    </span>
                    {review.isVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {review.title && (
                <p className="text-sm font-semibold text-gray-800 mt-2">{review.title}</p>
              )}
              {review.body && (
                <p className="text-sm text-gray-600 mt-1">{review.body}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
