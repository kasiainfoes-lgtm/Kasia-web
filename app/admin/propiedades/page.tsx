import Link from 'next/link';
import { adminPageGate } from '@/lib/admin-page-gate.server';
import { fetchRooms } from '@/lib/properties.server';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import DeletePropertyButton from '@/components/DeletePropertyButton';

export const dynamic = 'force-dynamic';

export default async function AdminPropertiesPage() {
  const gate = await adminPageGate('/admin/propiedades');
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  const rooms = await fetchRooms();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Propiedades</h1>

      <AdminTabs active="/admin/propiedades" />

      <div className="mb-6 flex justify-end">
        <Link
          href="/admin/propiedades/nueva"
          className="rounded-xl bg-vivi-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-vivi-navyLight"
        >
          + Agregar habitación
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div
              className="h-28 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${room.colorFrom}, ${room.colorTo})` }}
            />
            <p className="mt-3 font-semibold text-vivi-ink">{room.title}</p>
            <p className="text-sm text-vivi-muted">
              {room.zone} · {room.price} € / mes
            </p>
            <p className="mt-1 text-xs text-vivi-muted">Disponible desde {room.available}</p>
            <div className="mt-3 flex gap-2">
              <Link
                href={`/admin/propiedades/${room.id}`}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-vivi-ink hover:border-vivi-navy"
              >
                Editar
              </Link>
              <DeletePropertyButton id={room.id} title={room.title} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
