import Link from 'next/link';
import Image from 'next/image';
import { firstImageUrl, type Room } from '@/lib/rooms';
import FavoriteButton from '@/components/FavoriteButton';

export default function RoomCard({
  room,
  onToggleFavorite,
}: {
  room: Room;
  onToggleFavorite?: () => void;
}) {
  const thumbnail = firstImageUrl(room.photoUrls);
  return (
    <Link href={`/rooms/${room.id}`} className="group block">
      <div className="relative h-44 overflow-hidden rounded-2xl">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={room.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${room.colorFrom}, ${room.colorTo})`,
            }}
          />
        )}
        <FavoriteButton roomId={room.id} onToggle={onToggleFavorite} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-vivi-ink">{room.title}</p>
          <p className="text-sm text-vivi-muted">{room.zone}</p>
        </div>
        <span className="shrink-0 rounded-full bg-vivi-mintLight px-2.5 py-1 text-xs font-bold text-red-700">
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
