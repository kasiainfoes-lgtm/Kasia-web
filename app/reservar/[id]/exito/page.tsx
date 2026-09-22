import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRoomById } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import { getOwnBooking } from '@/lib/bookings.server';
import { canReviewManager, canReviewSite } from '@/lib/reviews.server';
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
  const booking = await getOwnBooking(userId, params.id);
  const { deposit, total } = calculateBookingTotal(room.price);
  const [canReviewMgr, canReviewSvc] = await Promise.all([
    canReviewManager(userId, room.managerEmail),
    canReviewSite(userId),
  ]);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <PostPaymentPanel
        room={room}
        alreadyPaid={booking?.status === 'pagado'}
        deposit={deposit}
        total={total}
        visitStatus={booking?.visitStatus ?? 'pendiente'}
        visitAt={booking?.visitAt ?? null}
        canReviewManager={canReviewMgr}
        canReviewSite={canReviewSvc}
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
