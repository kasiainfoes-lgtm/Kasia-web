import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { findAuthUserByEmail } from '@/lib/supabase/find-user.server';
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

  const body = await request.json().catch(() => null);

  // El id de la solicitud puede venir de la cookie (justo después de /apply,
  // en el mismo navegador) o del cuerpo del pedido (el link del email de
  // "aprobado", que puede abrirse días después y en otro dispositivo).
  const appId = cookies().get(APP_ID_COOKIE)?.value || body?.appId;
  if (!appId) {
    return NextResponse.json({ error: 'No encontramos tu solicitud. Vuelve a /apply.' }, { status: 400 });
  }

  const application = await getApplicationById(appId);
  if (!application || application.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Tu solicitud todavía no está aprobada.' }, { status: 403 });
  }

  const password = body?.password;
  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
  }

  // Puede pasar que la misma persona vuelva a pasar por /apply más adelante
  // (otra búsqueda), quede aprobada de nuevo, y ya tenga una cuenta de una
  // aprobación anterior (de esta misma solicitud, o con el mismo email desde
  // otra). En vez de trabarla con un "usuario ya existe" sin salida, en
  // cualquiera de esos casos re-vinculamos su cuenta existente a esta
  // solicitud y le seteamos la contraseña que acaba de elegir, para que entre
  // directo sin tener que recordar una contraseña vieja.
  const { data: existingProfileForApp } = await admin
    .from('profiles')
    .select('id')
    .eq('application_id', appId)
    .maybeSingle();

  let authUserId: string;

  if (existingProfileForApp) {
    const { error: updateError } = await admin.auth.admin.updateUserById(existingProfileForApp.id, { password });
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
    authUserId = existingProfileForApp.id;
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: application.email,
      password,
      email_confirm: true,
    });

    if (created?.user) {
      authUserId = created.user.id;
      const { error: profileError } = await admin.from('profiles').insert({
        id: authUserId,
        application_id: appId,
        application_status: application.status,
      });
      if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
    } else {
      const alreadyExists =
        createError?.code === 'email_exists' ||
        createError?.code === 'user_already_exists' ||
        /already (been )?registered|already exists/i.test(createError?.message ?? '');
      if (!alreadyExists) {
        return NextResponse.json(
          { error: createError?.message ?? 'No pudimos crear la cuenta.' },
          { status: 400 }
        );
      }

      const existingAuthUser = await findAuthUserByEmail(admin, application.email);
      if (!existingAuthUser) {
        return NextResponse.json(
          { error: createError?.message ?? 'No pudimos crear la cuenta.' },
          { status: 400 }
        );
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(existingAuthUser.id, { password });
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
      authUserId = existingAuthUser.id;

      const { data: existingProfileForUser } = await admin
        .from('profiles')
        .select('id')
        .eq('id', authUserId)
        .maybeSingle();

      if (existingProfileForUser) {
        await admin
          .from('profiles')
          .update({ application_id: appId, application_status: application.status })
          .eq('id', authUserId);
      } else {
        const { error: profileError } = await admin.from('profiles').insert({
          id: authUserId,
          application_id: appId,
          application_status: application.status,
        });
        if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }
  }

  await admin.from('profiles').update({ application_status: application.status }).eq('id', authUserId);

  // El inicio de sesión lo hace el navegador, no este endpoint: antes se
  // hacía acá mismo con el cliente de servidor, pero esa sesión viaja de
  // vuelta como cookies en la respuesta HTTP — con cualquier proxy de por
  // medio (como el que sirve el sitio en producción) alcanza con que no
  // reenvíe bien un Set-Cookie para que la cuenta quede creada pero sin
  // sesión, y la persona recién aprobada termine en /login después de
  // haber elegido su contraseña. El cliente de navegador en cambio escribe
  // la cookie directo con document.cookie, igual que ya hace /login.
  const response = NextResponse.json({ ok: true, email: application.email });
  response.cookies.delete(APP_ID_COOKIE);
  return response;
}
