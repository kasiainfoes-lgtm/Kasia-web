import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRoomById } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import { getOwnBookingStatus } from '@/lib/bookings.server';
import { calculateBookingTotal } from '@/lib/rooms';
import PostPaymentPanel from '@/components/PostPaymentPanel';

export const dynamic = 'force-dynamic';

export default async function ReservaExitoPage({ params }: { params: { id: string } }) {
  const { userId } = await requireApprovedAccess(`/reservar/${params.id}/exito`);
  const room = await fetchRoomById(params.id);
  if (!room) return notFound();

  // El estado real de la reserva decide qué se muestra: antes esta página
  // anunciaba "Pago recibido" a cualquiera que la abriera, incluso si el pago
  // nunca se confirmó o si entró escribiendo la URL a mano.
  const status = await getOwnBookingStatus(userId, params.id);
  const { deposit, total } = calculateBookingTotal(room.price);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <PostPaymentPanel
        room={room}
        alreadyPaid={status === 'pagado'}
        deposit={deposit}
        total={total}
      />

      <Link
        href="/rooms"
        className="mt-10 inline-block text-sm font-semibold text-vivi-navy hover:underline"
      >
        ← Volver al catálogo
      </Link>
    </section>
  );
}
