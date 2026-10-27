import { NextResponse } from 'next/server';
import { getOwnerUser } from '@/lib/require-owner.server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toPropertyRow, validateCoordinates, type PropertyInput } from '@/lib/property-input';

export async function POST(request: Request) {
  const access = await getOwnerUser();
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const input: PropertyInput = await request.json();
  if (!input.id || !input.title || !input.zone) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
  }
  const coordError = validateCoordinates(input.lat, input.lng);
  if (coordError) return NextResponse.json({ error: coordError }, { status: 400 });

  // Un propietario solo puede publicar a su propio nombre — nunca puede
  // cargar una habitación y ponerle el email de otro propietario (eso le
  // robaría la reserva/el cobro a esa otra cuenta).
  if (!access.isAdmin) input.managerEmail = access.email;

  const { error } = await admin.from('properties').insert(toPropertyRow(input));
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
