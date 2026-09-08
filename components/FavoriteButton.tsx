'use client';

import { useEffect, useState } from 'react';
import { isFavorite, toggleFavorite } from '@/lib/favorites';

export default function FavoriteButton({
  roomId,
  variant = 'overlay',
  onToggle,
}: {
  roomId: string;
  variant?: 'overlay' | 'inline';
  onToggle?: (favorited: boolean) => void;
}) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(roomId));
  }, [roomId]);

  const base =
    variant === 'overlay'
      ? 'absolute right-2 top-2 h-8 w-8 rounded-full bg-vivi-navy/40 backdrop-blur-sm'
      : 'h-9 w-9 rounded-full bg-vivi-bg';

  return (
    <button
      type="button"
      aria-label={fav ? 'Quitar de guardados' : 'Guardar'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = toggleFavorite(roomId);
        setFav(next);
        onToggle?.(next);
      }}
      className={`${base} flex items-center justify-center transition`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        stroke={fav ? '#FB7360' : variant === 'overlay' ? '#fff' : '#0F172A'}
        strokeWidth={2}
        fill={fav ? '#FB7360' : 'none'}
      >
        <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.7 4c2-.3 3.9.6 5 2.3C11.8 4.6 13.7 3.7 15.7 4 19.4 4.5 21 8 20 11.7 17.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}
