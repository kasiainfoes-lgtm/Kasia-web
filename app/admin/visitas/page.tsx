import { adminPageGate } from '@/lib/admin-page-gate.server';
import { fetchAllBookings } from '@/lib/admin.server';
import AdminGateMessage from '@/components/AdminGateMessage';
import AdminTabs from '@/components/AdminTabs';
import AdminVisitCalendar, { type CalendarVisit } from '@/components/AdminVisitCalendar';

export const dynamic = 'force-dynamic';

export default async function AdminVisitasPage() {
  const gate = await adminPageGate('/admin/visitas');
  if (!gate.ok) return <AdminGateMessage reason={gate.reason} />;

  const bookings = await fetchAllBookings();
  const visits: CalendarVisit[] = bookings
    .filter((b): b is typeof b & { visitAt: string } => !!b.visitAt && b.visitStatus !== 'pendiente')
    .map((b) => ({
      bookingId: b.id,
      roomTitle: b.roomTitle,
      manager: b.manager,
      userEmail: b.userEmail,
      visitAt: b.visitAt,
      visitStatus: b.visitStatus as 'agendada' | 'hecha',
    }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Panel interno</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Visitas</h1>

      <AdminTabs active="/admin/visitas" />

      <AdminVisitCalendar visits={visits} />
    </section>
  );
}
