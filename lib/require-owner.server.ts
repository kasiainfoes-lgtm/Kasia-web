import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser, getOwnProfile } from '@/lib/supabase/session.server';
import { isAdminEmail } from '@/lib/admin-auth';

export type OwnerAccess = { userId: string; email: string; isAdmin: boolean };

// Un propietario (role='owner') solo puede tocar SUS propias habitaciones —
// nunca las de otro propietario ni las que gestiona Kasia directamente. El
// equipo de Kasia (ADMIN_EMAILS) sigue teniendo acceso a todo, como admin
// "por encima" de cualquier propietario.
export async function getOwnerUser(): Promise<OwnerAccess | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const user = await getSessionUser();
  if (!user || !user.email) return null;

  if (isAdminEmail(user.email)) return { userId: user.id, email: user.email, isAdmin: true };

  const profile = await getOwnProfile(user.id);
  if (profile?.role !== 'owner') return null;

  return { userId: user.id, email: user.email, isAdmin: false };
}

export type OwnerGate =
  | { ok: true; email: string; isAdmin: boolean }
  | { ok: false; reason: 'unconfigured' | 'unauthorized' };

export async function ownerPageGate(nextPath: string): Promise<OwnerGate> {
  if (!createClient()) return { ok: false, reason: 'unconfigured' };

  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!user.email) return { ok: false, reason: 'unauthorized' };

  if (isAdminEmail(user.email)) return { ok: true, email: user.email, isAdmin: true };

  const profile = await getOwnProfile(user.id);
  if (profile?.role !== 'owner') return { ok: false, reason: 'unauthorized' };

  return { ok: true, email: user.email, isAdmin: false };
}

// Dueño de ESTA habitación puntual (o admin): se usa para bloquear que un
// propietario edite/borre/publique una propiedad que no es suya solo
// adivinando el id en la URL. Acepta tanto OwnerAccess como el resultado de
// ownerPageGate (ambos traen email + isAdmin).
export function ownsProperty(access: { email: string; isAdmin: boolean }, propertyManagerEmail: string): boolean {
  return access.isAdmin || propertyManagerEmail.toLowerCase() === access.email.toLowerCase();
}
