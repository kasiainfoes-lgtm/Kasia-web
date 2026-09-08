import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type ApprovedAccess = { userId: string; email: string | null };

// Protege /rooms, /rooms/[id] y /reservar/[id] en el servidor: hace falta
// estar logueado Y tener un perfil con application_status = 'APPROVED'.
// No es un chequeo de frontend — si Supabase no está configurado, esto
// redirige a /apply en vez de "fallar abierto" y mostrar el catálogo.
export async function requireApprovedAccess(nextPath: string): Promise<ApprovedAccess> {
  const supabase = createClient();
  if (!supabase) redirect('/apply');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('application_status')
    .eq('id', user.id)
    .single();

  if (profile?.application_status !== 'APPROVED') redirect('/apply');

  return { userId: user.id, email: user.email ?? null };
}
