import { NextResponse } from 'next/server';
import { getOwnerUser, ownsProperty } from '@/lib/require-owner.server';
import { createAdminClient } from '@/lib/supabase/admin';

// Publicar/ocultar una habitación sin pasar por todo el formulario de
// edición: solo cambia la columna published. Ocultarla no la borra — el
// dueño (admin o propietario) la sigue viendo en /admin/propiedades y puede
// volver a activarla cuando quiera.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const access = await getOwnerUser();
  if (!access) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const { data: existing } = await admin.from('properties').select('manager_email').eq('id', params.id).maybeSingle();
  if (!existing || !ownsProperty(access, existing.manager_email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { published } = await request.json().catch(() => ({ published: null }));
  if (typeof published !== 'boolean') {
    return NextResponse.json({ error: 'Falta el estado (published).' }, { status: 400 });
  }

  const { error } = await admin.from('properties').update({ published }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
