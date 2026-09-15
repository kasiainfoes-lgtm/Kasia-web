import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser, getOwnProfile } from '@/lib/supabase/session.server';

export type ApprovedAccess = { userId: string; email: string | null; applicationId: string | null };

// Protege /rooms, /rooms/[id] y /reservar/[id] en el servidor: hace falta
// estar logueado Y tener un perfil con application_status = 'APPROVED'.
// No es un chequeo de frontend — si Supabase no está configurado, esto
// redirige a /apply en vez de "fallar abierto" y mostrar el catálogo.
export async function requireApprovedAccess(nextPath: string): Promise<ApprovedAccess> {
  if (!createClient()) redirect('/apply');

  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  const profile = await getOwnProfile(user.id);
  if (profile?.applicationStatus !== 'APPROVED') redirect('/apply');

  return { userId: user.id, email: user.email ?? null, applicationId: profile.applicationId };
}

// Misma comprobación para rutas de API, que no pueden redirigir: devuelve null
// y cada route handler decide el status. Sin esto, /api/checkout y /api/kyc
// quedaban abiertos a cualquiera, y cada llamada anónima creaba una sesión de
// Stripe o de Didit (que se cobran por uso).
export async function getApprovedUser(): Promise<ApprovedAccess | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getOwnProfile(user.id);
  if (profile?.applicationStatus !== 'APPROVED') return null;

  return { userId: user.id, email: user.email ?? null, applicationId: profile.applicationId };
}
