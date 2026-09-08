import Link from 'next/link';
import type { Room } from '@/lib/rooms';
import FavoriteButton from '@/components/FavoriteButton';

export default function RoomCard({
  room,
  onToggleFavorite,
}: {
  room: Room;
  onToggleFavorite?: () => void;
}) {
  return (
    <Link href={`/rooms/${room.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="h-44 transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${room.colorFrom}, ${room.colorTo})`,
          }}
        />
        <FavoriteButton roomId={room.id} onToggle={onToggleFavorite} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-vivi-ink">{room.title}</p>
          <p className="text-sm text-vivi-muted">{room.zone}</p>
        </div>
        <span className="shrink-0 rounded-full bg-vivi-mintLight px-2.5 py-1 text-xs font-bold text-emerald-700">
          {room.match}% match
        </span>
      </div>
      <p className="mt-2 text-base font-bold text-vivi-ink">
        {room.price} € <span className="text-sm font-medium text-vivi-muted">/ mes</span>
      </p>
      <p className="text-xs text-vivi-muted">Disponible desde {room.available}</p>
    </Link>
  );
}
