import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { findAuthUserByEmail } from '@/lib/supabase/find-user.server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Alta de cuenta de propietario, al estilo "convertite en anfitrión" de
// Airbnb: cualquiera puede crearse una (no hace falta pasar por /apply ni
// que Kasia la apruebe primero), pero SIEMPRE queda con role='owner' —
// nunca puede auto-asignarse 'admin' desde acá.
export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });
  }

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const password = body?.password;

  if (!name || !email) {
    return NextResponse.json({ error: 'Completá tu nombre y tu email.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Ese email no parece válido.' }, { status: 400 });
  }
  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
  }

  const existing = await findAuthUserByEmail(admin, email);
  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe una cuenta con ese email. Iniciá sesión en vez de crear una nueva.' },
      { status: 409 }
    );
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (!created?.user) {
    return NextResponse.json({ error: createError?.message ?? 'No pudimos crear la cuenta.' }, { status: 400 });
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    role: 'owner',
    owner_name: name,
  });
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email });
}
