import { Star } from 'lucide-react';
import type { Review } from '@/lib/reviews.server';
import ReviewForm from '@/components/ReviewForm';

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          width={size}
          height={size}
          className={n <= rating ? 'fill-vivi-mint text-vivi-mint' : 'text-slate-300'}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({
  roomId,
  managerName,
  reviews,
  canReview,
}: {
  roomId: string;
  managerName: string;
  reviews: Review[];
  canReview: boolean;
}) {
  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return (
    <div className="border-b border-slate-200 py-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-extrabold text-vivi-ink">Reseñas de {managerName}</h2>
        {average !== null && (
          <span className="flex items-center gap-1 text-sm font-semibold text-vivi-ink">
            <Star width={16} height={16} className="fill-vivi-mint text-vivi-mint" />
            {average.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-vivi-muted">
        Lo que cuentan quienes ya alquilaron con {managerName} — en cualquiera de sus habitaciones.
      </p>

      {canReview && <ReviewForm roomId={roomId} managerName={managerName} />}

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-vivi-muted">Todavía no hay reseñas de {managerName}.</p>
      ) : (
        <div className="mt-4 space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-5 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-vivi-ink">{review.reviewerName}</p>
                <p className="text-xs text-vivi-muted">
                  {new Date(review.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="mt-1">
                <StarRow rating={review.rating} />
              </div>
              {review.comment && (
                <p className="mt-2 text-sm leading-relaxed text-vivi-muted">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
