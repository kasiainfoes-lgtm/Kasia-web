import { adminPageGate } from '@/lib/admin-page-gate.server';
import { fetchAllApplications } from '@/lib/applications.server';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import AdminApplicationActions from '@/components/AdminApplicationActions';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  APPROVED: 'Aprobado',
  REVIEW: 'En revisión',
  NOT_ELIGIBLE: 'Sin disponibilidad',
};

const STATUS_COLOR: Record<string, string> = {
  APPROVED: 'bg-vivi-mintLight text-red-700',
  REVIEW: 'bg-indigo-50 text-indigo-600',
  NOT_ELIGIBLE: 'bg-slate-100 text-vivi-muted',
};

const PET_LABEL: Record<string, string> = { ninguno: '—', perro: 'Perro', gato: 'Gato', otro: 'Otro' };

export default async function AdminSolicitudesPage() {
  const gate = await adminPageGate('/admin/solicitudes');
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  const applications = await fetchAllApplications();

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Solicitudes</h1>

      <AdminTabs active="/admin/solicitudes" />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-vivi-muted">
            <tr>
              <th className="px-4 py-3">Persona</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Documentos</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 align-top last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-vivi-ink">{a.name}</p>
                  <p className="text-xs text-vivi-muted">{a.email}</p>
                  {a.phone && <p className="text-xs text-vivi-muted">{a.phone}</p>}
                </td>
                <td className="px-4 py-3 text-vivi-ink">
                  <p>
                    {a.zone} · {a.budget} €
                  </p>
                  <p className="text-xs text-vivi-muted">
                    {a.occupationType === 'estudiante' ? 'Estudiante' : 'Trabajador/a'} · Mascota:{' '}
                    {PET_LABEL[a.petType]}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {a.financialProofPath && a.unpaidRentInsurancePath ? (
                    <div className="flex flex-col gap-1">
                      <a
                        href={`/api/admin/applications/${a.id}/documents/financial-proof`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-vivi-navy hover:underline"
                      >
                        Ver nómina / solvencia
                      </a>
                      <a
                        href={`/api/admin/applications/${a.id}/documents/unpaid-rent-insurance`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-vivi-navy hover:underline"
                      >
                        Ver seguro de impago
                      </a>
                    </div>
                  ) : a.documentsRequestedAt ? (
                    <p className="text-xs text-vivi-muted">Pedidos, esperando…</p>
                  ) : (
                    <p className="text-xs text-vivi-muted">No pedidos</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLOR[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {a.status === 'REVIEW' ? (
                    <AdminApplicationActions id={a.id} />
                  ) : (
                    <span className="text-xs text-vivi-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-vivi-muted">
                  Todavía no hay solicitudes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
