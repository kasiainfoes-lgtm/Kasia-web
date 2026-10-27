import { ownerPageGate } from '@/lib/require-owner.server';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import PropertyForm from '@/components/PropertyForm';

export const dynamic = 'force-dynamic';

export default async function NewPropertyPage() {
  const gate = await ownerPageGate('/admin/propiedades/nueva');
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Nueva habitación</h1>
      <AdminTabs role={gate.isAdmin ? 'admin' : 'owner'} active="/admin/propiedades" />
      <PropertyForm lockedManagerEmail={gate.isAdmin ? null : gate.email} />
    </section>
  );
}
