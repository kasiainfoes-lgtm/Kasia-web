import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRoomById } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import FavoriteButton from '@/components/FavoriteButton';

export const dynamic = 'force-dynamic';

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  await requireApprovedAccess(`/rooms/${params.id}`);
  const room = await fetchRoomById(params.id);
  if (!room) return notFound();

  const gradient = `linear-gradient(135deg, ${room.colorFrom}, ${room.colorTo})`;
  const gradientAlt = `linear-gradient(200deg, ${room.colorTo}, ${room.colorFrom})`;

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
          <span className="rounded-full bg-vivi-mintLight px-3 py-1 text-xs font-bold text-emerald-700">
            {room.match}% compatible
          </span>
          <FavoriteButton roomId={room.id} variant="inline" />
        </div>
      </div>

      <div className="mt-6 grid gap-1.5 overflow-hidden rounded-2xl sm:h-96 sm:grid-cols-3 sm:grid-rows-2">
        <div className="h-56 sm:col-span-1 sm:row-span-2 sm:h-full" style={{ background: gradient }} />
        <div className="hidden h-full sm:block" style={{ background: gradientAlt }} />
        <div className="hidden h-full sm:block" style={{ background: gradient }} />
        <div className="hidden h-full sm:block" style={{ background: gradientAlt }} />
        <div className="hidden h-full sm:block" style={{ background: gradient }} />
      </div>

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

          <div className="flex items-center gap-3 border-b border-slate-200 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-vivi-mintLight font-bold text-emerald-700">
              {room.manager.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-vivi-ink">Gestionado por {room.manager} · Asesora Kasia</p>
              <p className="text-xs text-vivi-muted">{room.responseTime}</p>
            </div>
          </div>

          <p className="max-w-2xl border-b border-slate-200 py-6 text-sm leading-relaxed text-vivi-muted">
            {room.description}
          </p>

          <div className="grid grid-cols-2 gap-3 py-6 sm:grid-cols-3">
            {room.amenities.map((a) => (
              <div key={a} className="flex items-center gap-2 text-sm text-vivi-ink">
                <span className="font-bold text-emerald-700">✓</span> {a}
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <span className="inline-block rounded-full bg-vivi-mintLight px-3 py-1 text-xs font-bold text-emerald-700">
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
