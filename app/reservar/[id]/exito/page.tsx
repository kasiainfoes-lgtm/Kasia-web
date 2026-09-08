import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRoomById } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import PostPaymentPanel from '@/components/PostPaymentPanel';

export const dynamic = 'force-dynamic';

export default async function ReservaExitoPage({ params }: { params: { id: string } }) {
  await requireApprovedAccess(`/reservar/${params.id}/exito`);
  const room = await fetchRoomById(params.id);
  if (!room) return notFound();

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <span className="inline-block rounded-full bg-vivi-mintLight px-4 py-1.5 text-xs font-bold text-emerald-700">
        Reserva confirmada
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-vivi-ink">Pago recibido</h1>
      <p className="mt-3 text-sm text-vivi-muted">
        Reservaste <strong>{room.title}</strong>. Coordiná tu visita y hablá con tu asesora cuando
        quieras.
      </p>

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
