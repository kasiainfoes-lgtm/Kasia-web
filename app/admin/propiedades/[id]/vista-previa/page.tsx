import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminPageGate } from '@/lib/admin-page-gate.server';
import { fetchRoomById } from '@/lib/properties.server';
import { getManagerReviews } from '@/lib/reviews.server';
import AdminGateMessage from '@/components/AdminGateMessage';
import AmenityIcon from '@/components/AmenityIcon';
import ReviewsSection from '@/components/ReviewsSection';
import RoomGallery from '@/components/RoomGallery';
import PropertiesMapLoader from '@/components/PropertiesMapLoader';

export const dynamic = 'force-dynamic';

// Igual que /rooms/[id] (la página real que ve un cliente aprobado), pero
// gateada por admin en vez de por una solicitud aprobada, y sin las partes
// que dependen de quién esté mirando (% de compatibilidad, favoritos, y el
// botón de reservar — que acá es solo visual). Sirve para revisar fotos,
// texto y comodidades antes de publicar, sin tener que crear una cuenta de
// prueba ni aprobarse a sí mismo una solicitud falsa.
export default async function PreviewPropertyPage({ params }: { params: { id: string } }) {
  const gate = await adminPageGate(`/admin/propiedades/${params.id}/vista-previa`);
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  const room = await fetchRoomById(params.id);
  if (!room) return notFound();

  const reviews = await getManagerReviews(room.managerEmail);

  return (
    <>
      <div className="sticky top-[65px] z-30 border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm font-semibold text-amber-800">
        Vista previa — así la ve un cliente aprobado.{' '}
        <Link href={`/admin/propiedades/${room.id}`} className="underline underline-offset-2">
          Volver a editar
        </Link>
        {!room.published && <span className="ml-2 font-normal">(está oculta: no la ve nadie todavía)</span>}
      </div>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-vivi-ink sm:text-3xl">{room.title}</h1>
            <p className="mt-1 text-sm text-vivi-muted">{room.zone} · Valencia</p>
          </div>
        </div>

        <RoomGallery media={room.photoUrls} title={room.title} colorFrom={room.colorFrom} colorTo={room.colorTo} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-6">
              <p className="text-2xl font-extrabold text-vivi-ink">
                {room.price} € <span className="text-sm font-medium text-vivi-muted">/ mes</span>
              </p>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                Disponible {room.available}
              </span>
            </div>

            <div className="flex items-center gap-3 border-b border-stone-200 py-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-vivi-mintLight font-bold text-vivi-mint">
                {room.manager.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-vivi-ink">Gestionado por {room.manager} · Equipo Kasia</p>
                <p className="text-xs text-vivi-muted">{room.responseTime}</p>
              </div>
            </div>

            <ReviewsSection roomId={room.id} managerName={room.manager} reviews={reviews} canReview={false} />

            <p className="max-w-2xl border-b border-stone-200 py-6 text-sm leading-relaxed text-vivi-muted">
              {room.description}
            </p>

            <div className="grid grid-cols-2 gap-3 border-b border-stone-200 py-6 sm:grid-cols-3">
              {room.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm text-vivi-ink">
                  <AmenityIcon label={a} className="h-4 w-4 shrink-0 text-vivi-mint" />
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

          <aside className="h-fit rounded-2xl border border-stone-200 bg-vivi-card p-6">
            <span className="inline-block rounded-full bg-vivi-mintLight px-3 py-1 text-xs font-bold text-vivi-mint">
              Vivienda habitual · mínimo 6 meses
            </span>
            <p className="mt-4 text-xl font-extrabold text-vivi-ink">
              {room.price} € <span className="text-sm font-medium text-vivi-muted">/ mes</span>
            </p>
            <div className="mt-4 flex justify-between border-y border-stone-200 py-3 text-sm">
              <span className="text-vivi-muted">Disponible desde</span>
              <span className="font-semibold text-vivi-ink">{room.available}</span>
            </div>
            <span className="mt-5 block rounded-xl bg-vivi-navy py-3 text-center text-sm font-bold text-white opacity-60">
              Reservar habitación
            </span>
            <p className="mt-3 text-center text-xs text-vivi-muted">
              Botón de ejemplo — acá no reserva nada de verdad
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
