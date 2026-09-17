import { adminPageGate } from '@/lib/admin-page-gate.server';
import { fetchAllBookings } from '@/lib/admin.server';
import { fetchRooms } from '@/lib/properties.server';
import { formatDateTimeEs, formatEurEs } from '@/lib/format';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import AdminVisitAction from '@/components/AdminVisitAction';
import AdminTransferProofActions from '@/components/AdminTransferProofActions';

// Nunca cachear esta página: muestra datos privados por sesión (auth + reservas).
export const dynamic = 'force-dynamic';

const STAGE_LABEL: Record<string, string> = {
  nuevo: 'Nuevo',
  verificado: 'Verificado',
  revision: 'En revisión',
  pagado: 'Pagado',
};

const STAGE_COLOR: Record<string, string> = {
  nuevo: '#E5484D',
  verificado: '#8B7CF6',
  revision: '#F5A623',
  pagado: '#FB7360',
};

const STAGE_ORDER = ['nuevo', 'verificado', 'revision', 'pagado'] as const;

export default async function AdminPage() {
  const gate = await adminPageGate('/admin');
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  const [bookings, rooms] = await Promise.all([fetchAllBookings(), fetchRooms()]);

  const pendingTransferReview = bookings.filter((b) => b.status === 'revision');
  const paid = bookings.filter((b) => b.status === 'pagado');
  const visitScheduledOrDone = bookings.filter(
    (b) => b.visitStatus === 'agendada' || b.visitStatus === 'hecha'
  );
  const visitDone = bookings.filter((b) => b.visitStatus === 'hecha');
  const depositRevenue = paid.reduce((sum, b) => sum + (b.amount ?? 0), 0);
  const stageCounts = STAGE_ORDER.map((stage) => ({
    stage,
    count: bookings.filter((b) => b.status === stage).length,
  }));
  const maxStageCount = Math.max(1, ...stageCounts.map((s) => s.count));

  const postPagoBars = [
    { label: 'Reserva pagada', count: paid.length, of: paid.length },
    { label: 'Visita agendada', count: visitScheduledOrDone.length, of: paid.length },
    { label: 'Visita realizada', count: visitDone.length, of: paid.length },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">
        Toda la operación en una sola vista.
      </h1>

      <AdminTabs active="/admin" />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Habitaciones activas" value={String(rooms.length)} accent="#E5484D" />
        <StatCard label="Reservas pagadas" value={String(paid.length)} accent="#5B93F2" />
        <StatCard
          label="Fianzas cobradas"
          value={`${formatEurEs(depositRevenue)} €`}
          accent="#8B7CF6"
        />
        <StatCard label="Visitas agendadas" value={String(visitScheduledOrDone.length)} accent="#FB7360" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-vivi-navy p-6 text-white">
          <h2 className="text-sm font-bold">Pipeline de reservas</h2>
          <div className="mt-6 flex items-end gap-6" style={{ height: 120 }}>
            {stageCounts.map(({ stage, count }) => (
              <div key={stage} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 rounded-t-lg"
                  style={{
                    height: `${Math.max(6, (count / maxStageCount) * 96)}px`,
                    background: STAGE_COLOR[stage],
                  }}
                />
                <p className="text-xs font-semibold">{STAGE_LABEL[stage]}</p>
                <p className="text-xs text-slate-400">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-vivi-navy p-6 text-white">
          <h2 className="text-sm font-bold">Operación post-pago</h2>
          <div className="mt-6 space-y-4">
            {postPagoBars.map((bar) => {
              const pct = bar.of > 0 ? Math.round((bar.count / bar.of) * 100) : 0;
              return (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{bar.label}</span>
                    <span>{bar.count}</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-vivi-mint"
                      style={{ width: `${bar.label === 'Reserva pagada' ? 100 : pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-slate-400">
            Sobre el total de reservas pagadas ({paid.length}).
          </p>
        </div>
      </div>

      {pendingTransferReview.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-extrabold text-vivi-ink">
            Comprobantes de transferencia pendientes de revisión ({pendingTransferReview.length})
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-amber-300 bg-amber-50/40">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-amber-200 text-xs uppercase tracking-wide text-vivi-muted">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Habitación</th>
                  <th className="px-4 py-3">Enviado</th>
                  <th className="px-4 py-3">Comprobante</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransferReview.map((b) => (
                  <tr key={b.id} className="border-b border-amber-100 last:border-0">
                    <td className="px-4 py-3 text-vivi-ink">{b.userEmail ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-vivi-ink">{b.roomTitle}</p>
                      <p className="text-xs text-vivi-muted">{b.roomZone}</p>
                    </td>
                    <td className="px-4 py-3 text-vivi-ink">
                      {b.transferProofSubmittedAt ? formatDateTimeEs(b.transferProofSubmittedAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/api/admin/bookings/${b.id}/proof`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-vivi-navy hover:underline"
                      >
                        Ver comprobante
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <AdminTransferProofActions bookingId={b.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-vivi-muted">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Habitación</th>
              <th className="px-4 py-3">Etapa</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Visita</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 text-vivi-ink">{b.userEmail ?? '—'}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-vivi-ink">{b.roomTitle}</p>
                  <p className="text-xs text-vivi-muted">{b.roomZone}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      b.status === 'pagado'
                        ? 'bg-vivi-mintLight text-red-700'
                        : b.status === 'revision'
                          ? 'bg-amber-50 text-amber-700'
                          : b.status === 'verificado'
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'bg-slate-100 text-vivi-muted'
                    }`}
                  >
                    {STAGE_LABEL[b.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-vivi-ink">{b.amount ? `${b.amount.toFixed(2)} €` : '—'}</td>
                <td className="px-4 py-3">
                  <p className="text-vivi-ink">
                    {b.visitStatus === 'pendiente'
                      ? 'Pendiente'
                      : b.visitStatus === 'agendada'
                        ? 'Agendada'
                        : 'Hecha'}
                  </p>
                  {b.visitAt && <p className="text-xs text-vivi-muted">{formatDateTimeEs(b.visitAt)}</p>}
                </td>
                <td className="px-4 py-3">
                  <AdminVisitAction bookingId={b.id} visitStatus={b.visitStatus} />
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-vivi-muted">
                  Todavía no hay reservas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <p className="text-2xl font-extrabold text-vivi-ink">{value}</p>
      <p className="mt-1 text-xs font-medium text-vivi-muted">{label}</p>
    </div>
  );
}
