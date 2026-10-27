import Link from 'next/link';
import Image from 'next/image';
import { ownerPageGate } from '@/lib/require-owner.server';
import { fetchRooms, fetchAllRoomsByManagerEmail } from '@/lib/properties.server';
import { firstImageUrl } from '@/lib/rooms';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import DeletePropertyButton from '@/components/DeletePropertyButton';
import PublishToggle from '@/components/PublishToggle';

export const dynamic = 'force-dynamic';

export default async function AdminPropertiesPage() {
  const gate = await ownerPageGate('/admin/propiedades');
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  // El equipo de Kasia ve todas las propiedades; un propietario externo
  // solo ve las suyas, identificadas por el email con el que cargó cada
  // habitación (manager_email).
  const rooms = gate.isAdmin ? await fetchRooms() : await fetchAllRoomsByManagerEmail(gate.email);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Propiedades</h1>

      <AdminTabs role={gate.isAdmin ? 'admin' : 'owner'} active="/admin/propiedades" />

      <div className="mb-6 flex justify-end">
        <Link
          href="/admin/propiedades/nueva"
          className="rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight"
        >
          + Agregar habitación
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const thumbnail = firstImageUrl(room.photoUrls);
          return (
          <div
            key={room.id}
            className={`rounded-2xl border bg-vivi-card p-4 ${
              room.published ? 'border-stone-200' : 'border-stone-200 opacity-60'
            }`}
          >
            {thumbnail ? (
              <div className="relative h-28 overflow-hidden rounded-xl">
                <Image
                  src={thumbnail}
                  alt={room.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-28 rounded-xl bg-stone-200" />
            )}
            <p className="mt-3 font-semibold text-vivi-ink">{room.title}</p>
            <p className="text-sm text-vivi-muted">
              {room.zone} · {room.price} € / mes
            </p>
            <p className="mt-1 text-xs text-vivi-muted">Disponible desde {room.available}</p>
            <div className="mt-3">
              <PublishToggle id={room.id} published={room.published} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/admin/propiedades/${room.id}`}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-vivi-ink hover:border-vivi-navy"
              >
                Editar
              </Link>
              <Link
                href={`/admin/propiedades/${room.id}/vista-previa`}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-vivi-ink hover:border-vivi-navy"
              >
                Vista previa
              </Link>
              <DeletePropertyButton id={room.id} title={room.title} />
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
