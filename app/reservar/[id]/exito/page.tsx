import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRoomById } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import { calculateBookingTotal } from '@/lib/rooms';
import PostPaymentPanel from '@/components/PostPaymentPanel';

export const dynamic = 'force-dynamic';

export default async function ReservaExitoPage({ params }: { params: { id: string } }) {
  await requireApprovedAccess(`/reservar/${params.id}/exito`);
  const room = await fetchRoomById(params.id);
  if (!room) return notFound();

  const { deposit, commission, total } = calculateBookingTotal(room.price);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <span className="inline-block rounded-full bg-vivi-mintLight px-4 py-1.5 text-xs font-bold text-red-700">
        Reserva confirmada
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-vivi-ink">Pago recibido</h1>
      <p className="mt-3 text-sm text-vivi-muted">
        Has reservado <strong>{room.title}</strong>. Coordina tu visita y habla con tu asesora cuando
        quieras.
      </p>

      <dl className="mx-auto mt-6 max-w-sm space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-vivi-muted">Fianza (1 mensualidad)</dt>
          <dd className="font-bold text-vivi-ink">{deposit.toFixed(2)} €</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-vivi-muted">Comisión Kasia (fija)</dt>
          <dd className="font-bold text-vivi-ink">{commission.toFixed(2)} €</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
          <dt className="font-bold text-vivi-ink">TOTAL PAGADO</dt>
          <dd className="font-extrabold text-vivi-ink">{total.toFixed(2)} €</dd>
        </div>
      </dl>

      <PostPaymentPanel room={room} />

      <Link
        href="/rooms"
        className="mt-10 inline-block text-sm font-semibold text-vivi-navy hover:underline"
      >
        ← Volver al catálogo
      </Link>
    </section>
  );
}
