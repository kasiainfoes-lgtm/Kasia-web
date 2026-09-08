import { notFound } from 'next/navigation';
import { adminPageGate } from '@/lib/admin-page-gate.server';
import { fetchRoomById } from '@/lib/properties.server';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import PropertyForm from '@/components/PropertyForm';

export const dynamic = 'force-dynamic';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const gate = await adminPageGate(`/admin/propiedades/${params.id}`);
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  const room = await fetchRoomById(params.id);
  if (!room) return notFound();

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Editar habitación</h1>
      <AdminTabs active="/admin/propiedades" />
      <PropertyForm initial={room} />
    </section>
  );
}
