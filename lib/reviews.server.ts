import { createClient } from '@/lib/supabase/server';

export type Review = {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export async function getRoomReviews(roomId: string): Promise<Review[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('reviews')
    .select('id, reviewer_name, rating, comment, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  }));
}

// Solo puede reseñar quien tenga una reserva pagada de esta habitación y
// todavía no la haya reseñado. La policy de insert de `reviews` exige lo
// mismo del lado de la base — esto es solo para decidir si mostrar el
// formulario, no la única barrera de seguridad.
export async function canReviewRoom(userId: string, roomId: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const [{ data: booking }, { data: existingReview }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .eq('status', 'pagado')
      .maybeSingle(),
    supabase.from('reviews').select('id').eq('room_id', roomId).eq('user_id', userId).maybeSingle(),
  ]);

  return !!booking && !existingReview;
}
