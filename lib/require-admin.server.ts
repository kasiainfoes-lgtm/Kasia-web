import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin-auth';

// Para rutas de API: devuelve el usuario si es admin, o null (401/403 lo decide
// cada route handler).
export async function getAdminUser() {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
