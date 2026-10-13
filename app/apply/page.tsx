import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser, getOwnProfile } from '@/lib/supabase/session.server';
import { getApplicationById } from '@/lib/applications.server';
import { fetchRooms } from '@/lib/properties.server';
import { uniqueZones } from '@/lib/rooms';
import { APP_ID_COOKIE } from '@/lib/apply-session';
import ApplyWizard from '@/components/ApplyWizard';

export const dynamic = 'force-dynamic';

// Antes esta página mostraba el formulario siempre, sin mirar si la persona
// ya tenía cuenta o ya había enviado una solicitud — alguien ya aprobado (con
// cuenta, o con el link del email) terminaba completando el filtro de nuevo
// en vez de entrar directo. Acá se corta eso antes de renderizar el wizard.
export default async function ApplyPage() {
  const user = await getSessionUser();
  if (user) {
    const profile = await getOwnProfile(user.id);
    if (profile?.applicationStatus === 'APPROVED') redirect('/rooms');
  }

  const appId = cookies().get(APP_ID_COOKIE)?.value;
  if (appId) {
    const application = await getApplicationById(appId);
    // Si la encuentra, /apply/result decide qué mostrar según su estado real
    // (aprobada → crear cuenta, en revisión → esperar, etc). Si la cookie
    // quedó de una solicitud que ya no existe, se sigue de largo al formulario.
    if (application) redirect('/apply/result');
  }

  const rooms = await fetchRooms();
  const zones = uniqueZones(rooms);

  return <ApplyWizard zones={zones} />;
}
