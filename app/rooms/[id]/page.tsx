import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRoomById } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import { getManagerReviews, canReviewManager } from '@/lib/reviews.server';
import FavoriteButton from '@/components/FavoriteButton';
import AmenityIcon from '@/components/AmenityIcon';
import ReviewsSection from '@/components/ReviewsSection';
import RoomGallery from '@/components/RoomGallery';
import PropertiesMapLoader from '@/components/PropertiesMapLoader';

export const dynamic = 'force-dynamic';

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await requireApprovedAccess(`/rooms/${params.id}`);
  const room = await fetchRoomById(params.id);
  if (!room) return notFound();

  const [reviews, canReview] = await Promise.all([
    getManagerReviews(room.managerEmail),
    canReviewManager(userId, room.managerEmail),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/rooms" className="text-sm font-medium text-vivi-muted hover:text-vivi-navy">
        ← Volver a la búsqueda
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-vivi-ink sm:text-3xl">{room.title}</h1>
          <p className="mt-1 text-sm text-vivi-muted">{room.zone} · Valencia</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-vivi-mintLight px-3 py-1 text-xs font-bold text-red-700">
            {room.match}% compatible
          </span>
          <FavoriteButton roomId={room.id} variant="inline" />
        </div>
      </div>

      <RoomGallery media={room.photoUrls} title={room.title} colorFrom={room.colorFrom} colorTo={room.colorTo} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-6">
            <p className="text-2xl font-extrabold text-vivi-ink">
              {room.price} € <span className="text-sm font-medium text-vivi-muted">/ mes</span>
            </p>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              Disponible {room.available}
            </span>
          </div>

          <Link
            href={`/asesores/${encodeURIComponent(room.managerEmail)}`}
            className="flex items-center gap-3 border-b border-slate-200 py-6 hover:bg-slate-50"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-vivi-mintLight font-bold text-red-700">
              {room.manager.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-vivi-ink">Gestionado por {room.manager} · Equipo Kasia</p>
              <p className="text-xs text-vivi-muted">{room.responseTime}</p>
            </div>
            <span className="ml-auto text-xs font-semibold text-vivi-navy">Ver todas sus habitaciones →</span>
          </Link>

          <ReviewsSection
            roomId={room.id}
            managerName={room.manager}
            reviews={reviews}
            canReview={canReview}
          />

          <p className="max-w-2xl border-b border-slate-200 py-6 text-sm leading-relaxed text-vivi-muted">
            {room.description}
          </p>

          <div className="grid grid-cols-2 gap-3 border-b border-slate-200 py-6 sm:grid-cols-3">
            {room.amenities.map((a) => (
              <div key={a} className="flex items-center gap-2 text-sm text-vivi-ink">
                <AmenityIcon label={a} className="h-4 w-4 shrink-0 text-red-700" />
                {a}
              </div>
            ))}
          </div>

          <div className="py-6">
            <h2 className="text-lg font-extrabold text-vivi-ink">Ubicación</h2>
            <p className="mt-1 text-sm text-vivi-muted">{room.zone}, Valencia</p>
            <div className="mt-4">
              <PropertiesMapLoader rooms={[room]} height={320} />
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <span className="inline-block rounded-full bg-vivi-mintLight px-3 py-1 text-xs font-bold text-red-700">
            Vivienda habitual · mínimo 6 meses
          </span>
          <p className="mt-4 text-xl font-extrabold text-vivi-ink">
            {room.price} € <span className="text-sm font-medium text-vivi-muted">/ mes</span>
          </p>
          <div className="mt-4 flex justify-between border-y border-slate-200 py-3 text-sm">
            <span className="text-vivi-muted">Disponible desde</span>
            <span className="font-semibold text-vivi-ink">{room.available}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 py-3 text-sm">
            <span className="text-vivi-muted">Compatibilidad</span>
            <span className="font-semibold text-vivi-ink">{room.match}%</span>
          </div>
          <Link
            href={`/reservar/${room.id}`}
            className="mt-5 block rounded-xl bg-vivi-mint py-3 text-center text-sm font-bold text-vivi-navy transition hover:brightness-95"
          >
            Reservar habitación
          </Link>
          <p className="mt-3 text-center text-xs text-vivi-muted">
            Login, filtrado y verificación solo al reservar
          </p>
        </aside>
      </div>
    </section>
  );
}
