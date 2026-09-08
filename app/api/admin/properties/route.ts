import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';
import { toPropertyRow, type PropertyInput } from '@/lib/property-input';

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const input: PropertyInput = await request.json();
  if (!input.id || !input.title || !input.zone) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
  }

  const { error } = await admin.from('properties').insert(toPropertyRow(input));
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
