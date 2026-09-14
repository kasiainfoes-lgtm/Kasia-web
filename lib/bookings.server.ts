import { createClient } from '@/lib/supabase/server';

export type BookingStatus = 'nuevo' | 'verificado' | 'pagado';

export async function getOwnBookingStatus(userId: string, roomId: string): Promise<BookingStatus | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('bookings')
    .select('status')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .maybeSingle();

  return (data?.status as BookingStatus) ?? null;
}
