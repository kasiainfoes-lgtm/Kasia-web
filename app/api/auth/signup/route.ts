import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getApplicationById } from '@/lib/applications.server';
import { APP_ID_COOKIE } from '@/lib/apply-session';

// La cuenta se crea SIEMPRE del lado del servidor, nunca con supabase.auth.signUp()
// directo desde el navegador: así el email viene de la solicitud ya verificada
// (APPROVED) y no de lo que el cliente diga que es, y nadie puede llegar acá
// sin haber pasado antes por /apply.
export async function POST(request: Request) {
  const admin = createAdminClient();
  const supabase = createClient();
  if (!admin || !supabase) {
    return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });
  }

  const appId = cookies().get(APP_ID_COOKIE)?.value;
  if (!appId) {
    return NextResponse.json({ error: 'No encontramos tu solicitud. Volvé a /apply.' }, { status: 400 });
  }

  const application = await getApplicationById(appId);
  if (!application || application.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Tu solicitud todavía no está aprobada.' }, { status: 403 });
  }

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('application_id', appId)
    .maybeSingle();
  if (existingProfile) {
    return NextResponse.json(
      { error: 'Esta solicitud ya se usó para crear una cuenta. Iniciá sesión.' },
      { status: 409 }
    );
  }

  const { password } = await request.json();
  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: application.email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? 'No pudimos crear la cuenta.' },
      { status: 400 }
    );
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id,
    application_id: appId,
    application_status: application.status,
  });
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: application.email,
    password,
  });
  if (signInError) {
    return NextResponse.json({ error: signInError.message }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(APP_ID_COOKIE);
  return response;
}
