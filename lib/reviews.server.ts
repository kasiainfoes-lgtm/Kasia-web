import { createClient } from '@/lib/supabase/server';

export type Review = {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

// Las reseñas son sobre el/la asesor/a (identificado por su email), no sobre
// una habitación puntual: alguien que reservó dos habitaciones distintas del
// mismo asesor solo puede dejar una reseña, y esa reseña se muestra en todas
// las habitaciones que gestiona.
export async function getManagerReviews(managerEmail: string): Promise<Review[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('reviews')
    .select('id, reviewer_name, rating, comment, created_at')
    .eq('manager_email', managerEmail)
    .order('created_at', { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    reviewerName: row.reviewer_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  }));
}

// Solo puede reseñar quien tenga una reserva pagada de alguna habitación de
// este asesor y todavía no lo haya reseñado. La policy de insert de
// `reviews` exige lo mismo del lado de la base — esto es solo para decidir
// si mostrar el formulario, no la única barrera de seguridad.
export async function canReviewManager(userId: string, managerEmail: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const [{ data: paidBookings }, { data: existingReview }] = await Promise.all([
    supabase.from('bookings').select('room_id').eq('user_id', userId).eq('status', 'pagado'),
    supabase.from('reviews').select('id').eq('manager_email', managerEmail).eq('user_id', userId).maybeSingle(),
  ]);
  if (existingReview || !paidBookings || paidBookings.length === 0) return false;

  const roomIds = paidBookings.map((b) => b.room_id);
  const { data: matchingRoom } = await supabase
    .from('properties')
    .select('id')
    .in('id', roomIds)
    .eq('manager_email', managerEmail)
    .limit(1)
    .maybeSingle();

  return !!matchingRoom;
}
