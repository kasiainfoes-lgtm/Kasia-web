import { notFound } from 'next/navigation';
import { fetchRoomById } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import BookingWizard from '@/components/BookingWizard';

export const dynamic = 'force-dynamic';

export default async function ReservarPage({ params }: { params: { id: string } }) {
  await requireApprovedAccess(`/reservar/${params.id}`);
  const room = await fetchRoomById(params.id);
  if (!room) return notFound();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Reserva y pago</p>
      <h1 className="mt-2 text-3xl font-extrabold text-vivi-ink sm:text-4xl">
        Se reserva con fianza + comisión automática.
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-vivi-muted">
        No existe una seña separada. La fianza equivale a una mensualidad y Kasia cobra una comisión
        fija de 50 € en el mismo momento del pago. Vivienda habitual, estancia mínima de 6 meses.
      </p>

      <div className="mt-10">
        <BookingWizard room={room} />
      </div>
    </section>
  );
}
