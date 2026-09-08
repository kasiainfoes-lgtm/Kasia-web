import { adminPageGate } from '@/lib/admin-page-gate.server';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import IntegrationsForm from '@/components/IntegrationsForm';

export const dynamic = 'force-dynamic';

export default async function AdminIntegrationsPage() {
  const gate = await adminPageGate('/admin/integraciones');
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Integraciones</h1>
      <AdminTabs active="/admin/integraciones" />
      <p className="-mt-4 mb-6 text-sm text-vivi-muted">
        Cargá tus claves acá directamente — no hace falta tocar variables de entorno ni redesplegar
        el sitio.
      </p>
      <IntegrationsForm />
    </section>
  );
}
