import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOwnProfile } from '@/lib/supabase/session.server';
import { getApplicationById } from '@/lib/applications.server';

// Mismo patrón que /api/rooms/[id]/reviews: la policy de insert de
// `site_reviews` es la que realmente decide si se puede guardar (reserva
// pagada, una reseña por persona). El nombre nunca lo manda el cliente.
export async function POST(request: Request) {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'La puntuación debe ser de 1 a 5.' }, { status: 400 });
  }
  const comment = typeof body?.comment === 'string' ? body.comment.trim().slice(0, 1000) || null : null;

  const profile = await getOwnProfile(user.id);
  const application = profile?.applicationId ? await getApplicationById(profile.applicationId) : null;
  const reviewerName = application?.name ?? 'Usuario Kasia';

  const { error } = await supabase.from('site_reviews').insert({
    user_id: user.id,
    reviewer_name: reviewerName,
    rating,
    comment,
  });

  if (error) {
    const message =
      error.code === '23505'
        ? 'Ya dejaste una reseña del servicio.'
        : 'No pudimos guardar tu reseña. Solo se puede reseñar con una reserva ya pagada.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
