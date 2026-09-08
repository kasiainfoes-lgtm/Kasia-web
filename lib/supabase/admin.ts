import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Cliente con la service_role key: se salta RLS, así que SOLO se importa desde
// código de servidor (rutas API, páginas server-only del panel /admin) y nunca
// desde un componente 'use client'. La key nunca se expone al navegador.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
