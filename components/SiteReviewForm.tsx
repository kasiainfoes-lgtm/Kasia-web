'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';

export default function SiteReviewForm() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Elegí una puntuación de 1 a 5.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/site-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No pudimos guardar tu reseña.');
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos guardar tu reseña.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-xl bg-vivi-mintLight px-4 py-3 text-sm font-medium text-red-700">
        ¡Gracias por tu reseña!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-vivi-ink">¿Cómo fue tu experiencia con Kasia?</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${n} estrellas`}
            className="p-0.5"
          >
            <Star
              width={24}
              height={24}
              className={n <= (hoverRating || rating) ? 'fill-vivi-mint text-vivi-mint' : 'text-slate-300'}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Contá cómo fue tu experiencia en general (opcional)"
        rows={3}
        maxLength={1000}
        className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-xl bg-vivi-navy px-4 py-2 text-xs font-semibold text-white hover:bg-vivi-navyLight disabled:opacity-60"
      >
        {submitting ? 'Enviando…' : 'Publicar reseña'}
      </button>
    </form>
  );
}
