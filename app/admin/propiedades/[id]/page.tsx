import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ownerPageGate, ownsProperty } from '@/lib/require-owner.server';
import { fetchRoomById } from '@/lib/properties.server';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import PropertyForm from '@/components/PropertyForm';
import PublishToggle from '@/components/PublishToggle';

export const dynamic = 'force-dynamic';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const gate = await ownerPageGate(`/admin/propiedades/${params.id}`);
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  const room = await fetchRoomById(params.id);
  if (!room) return notFound();
  // Un propietario no puede editar la habitación de otro propietario
  // adivinando el id en la URL.
  if (!ownsProperty(gate, room.managerEmail)) return notFound();

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-vivi-ink sm:text-3xl">Editar habitación</h1>
        <div className="flex items-center gap-4">
          <PublishToggle id={room.id} published={room.published} />
          <Link
            href={`/admin/propiedades/${room.id}/vista-previa`}
            className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-vivi-ink hover:border-vivi-navy"
          >
            Vista previa
          </Link>
        </div>
      </div>
      <AdminTabs role={gate.isAdmin ? 'admin' : 'owner'} active="/admin/propiedades" />
      <PropertyForm initial={room} lockedManagerEmail={gate.isAdmin ? null : gate.email} />
    </section>
  );
}
