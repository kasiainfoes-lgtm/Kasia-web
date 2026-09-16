import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOwnProfile } from '@/lib/supabase/session.server';
import { getApplicationById } from '@/lib/applications.server';
import { fetchRoomById } from '@/lib/properties.server';

// La escritura pasa por el cliente atado a la sesión (no admin): la policy
// "users review advisors of rooms they booked and paid for" es la que
// realmente decide si se puede insertar. El nombre nunca lo manda el cliente
// — se resuelve acá desde su solicitud aprobada, para no mostrar un nombre
// que alguien inventó. La reseña es sobre el/la asesor/a de esta habitación
// (manager_email), no sobre la habitación puntual: si reservó otra
// habitación del mismo asesor, cuenta como la misma reseña.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const room = await fetchRoomById(params.id);
  if (!room) return NextResponse.json({ error: 'Habitación no encontrada.' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const rating = Number(body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'La puntuación debe ser de 1 a 5.' }, { status: 400 });
  }
  const comment = typeof body?.comment === 'string' ? body.comment.trim().slice(0, 1000) || null : null;

  const profile = await getOwnProfile(user.id);
  const application = profile?.applicationId ? await getApplicationById(profile.applicationId) : null;
  const reviewerName = application?.name ?? 'Usuario Kasia';

  const { error } = await supabase.from('reviews').insert({
    room_id: room.id,
    manager_email: room.managerEmail,
    user_id: user.id,
    reviewer_name: reviewerName,
    rating,
    comment,
  });

  if (error) {
    const message =
      error.code === '23505'
        ? 'Ya dejaste una reseña para este asesor.'
        : 'No pudimos guardar tu reseña. Solo se puede reseñar a un asesor de una habitación que ya hayas reservado y pagado.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
