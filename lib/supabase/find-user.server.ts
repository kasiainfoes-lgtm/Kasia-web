import type { SupabaseClient } from '@supabase/supabase-js';

// La API admin no ofrece un filtro por email en esta versión del SDK (solo
// pagina por page/perPage), así que recorremos las páginas y comparamos
// nosotros — un volumen totalmente razonable para el tamaño de este proyecto.
export async function findAuthUserByEmail(admin: SupabaseClient, email: string) {
  const target = email.trim().toLowerCase();
  const perPage = 1000;
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) return null;
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;
    if (data.users.length < perPage) return null;
  }
  return null;
}
