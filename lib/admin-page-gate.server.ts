import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/supabase/session.server';
import { isAdminEmail } from '@/lib/admin-auth';

export type AdminGate = { ok: true; email: string } | { ok: false; reason: 'unconfigured' | 'unauthorized' };

// Para páginas server-only de /admin/*: redirige a /login si no hay sesión,
// y devuelve un resultado que la página puede usar para mostrar "no
// configurado" o "no autorizado" sin repetir esta lógica en cada archivo.
export async function adminPageGate(nextPath = '/admin'): Promise<AdminGate> {
  if (!createClient()) return { ok: false, reason: 'unconfigured' };

  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!isAdminEmail(user.email)) return { ok: false, reason: 'unauthorized' };
  return { ok: true, email: user.email! };
}
