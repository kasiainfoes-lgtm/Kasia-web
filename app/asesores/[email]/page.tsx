import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import { fetchRoomsByManagerEmail } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import { getManagerReviews } from '@/lib/reviews.server';
import RoomCard from '@/components/RoomCard';

export const dynamic = 'force-dynamic';

// Perfil del asesor, al estilo de la página de un anfitrión en Airbnb: todas
// sus habitaciones juntas en un mapa, más el listado y sus reseñas. Se llega
// acá haciendo click en "Gestionado por ..." desde cualquiera de sus
// habitaciones.
export default async function AdvisorPage({ params }: { params: { email: string } }) {
  await requireApprovedAccess(`/asesores/${params.email}`);

  const managerEmail = decodeURIComponent(params.email);
  const [rooms, reviews] = await Promise.all([
    fetchRoomsByManagerEmail(managerEmail),
    getManagerReviews(managerEmail),
  ]);

  if (rooms.length === 0) return notFound();

  const manager = rooms[0];
  const average = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/rooms" className="text-sm font-medium text-vivi-muted hover:text-vivi-navy">
        ← Volver a la búsqueda
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vivi-mintLight text-xl font-bold text-red-700">
          {manager.manager.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-vivi-ink sm:text-3xl">{manager.manager}</h1>
          <p className="text-sm text-vivi-muted">{manager.responseTime}</p>
          {average !== null && (
            <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-vivi-ink">
              <Star width={16} height={16} className="fill-vivi-mint text-vivi-mint" />
              {average.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
            </span>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold text-vivi-ink">
        {rooms.length} {rooms.length === 1 ? 'habitación' : 'habitaciones'} gestionadas por {manager.manager}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </section>
  );
}
