import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toPropertyRow, validateCoordinates, type PropertyInput } from '@/lib/property-input';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const input: PropertyInput = await request.json();
  const coordError = validateCoordinates(input.lat, input.lng);
  if (coordError) return NextResponse.json({ error: coordError }, { status: 400 });

  const row = toPropertyRow(input);
  delete (row as any).id;

  const { error } = await admin.from('properties').update(row).eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  // Antes esto fallaba (23503, foreign_key_violation) apenas alguien había
  // abierto /reservar/[id] una sola vez para esta habitación, porque eso ya
  // deja una fila en bookings — el admin tenía que ir a cancelar esa reserva
  // a mano antes de poder borrar. Como acá ya se confirmó que es una acción
  // permanente, se limpian esas referencias primero en vez de bloquear.
  await admin.from('bookings').delete().eq('room_id', params.id);
  await admin.from('applications').update({ final_choice_room_id: null }).eq('final_choice_room_id', params.id);

  const { error } = await admin.from('properties').delete().eq('id', params.id);
  if (error) {
    if (error.code === '23503') {
      return NextResponse.json(
        {
          error:
            'No se puede eliminar: todavía hay datos que dependen de esta habitación. Escribile a soporte técnico si esto se repite.',
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
