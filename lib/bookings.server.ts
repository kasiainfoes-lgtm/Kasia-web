import { createClient } from '@/lib/supabase/server';

export type BookingStatus = 'nuevo' | 'verificado' | 'revision' | 'pagado';
export type VisitStatus = 'pendiente' | 'agendada' | 'hecha';

export type OwnBooking = {
  status: BookingStatus;
  termsAcceptedAt: string | null;
  transferReviewRejectionNote: string | null;
  visitStatus: VisitStatus;
  visitAt: string | null;
};

export async function getOwnBookingStatus(userId: string, roomId: string): Promise<BookingStatus | null> {
  const booking = await getOwnBooking(userId, roomId);
  return booking?.status ?? null;
}

export async function getOwnBooking(userId: string, roomId: string): Promise<OwnBooking | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('bookings')
    .select('status, terms_accepted_at, transfer_review_rejection_note, visit_status, visit_at')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return null;
  return {
    status: data.status as BookingStatus,
    termsAcceptedAt: data.terms_accepted_at,
    transferReviewRejectionNote: data.transfer_review_rejection_note,
    visitStatus: data.visit_status as VisitStatus,
    visitAt: data.visit_at,
  };
}
