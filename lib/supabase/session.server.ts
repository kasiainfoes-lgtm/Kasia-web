import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

// El layout raíz renderiza <Navbar> en cada página, y varias páginas además
// llaman a su propio chequeo de sesión (requireApprovedAccess, adminPageGate,
// etc). Sin memoizar, cada uno de esos disparaba su propia ida y vuelta a
// Supabase para pedir el mismo usuario/perfil, multiplicando la latencia de
// cada carga de página. `cache()` de React deduplica automáticamente
// llamadas idénticas dentro del mismo request en Server Components.
export const getSessionUser = cache(async () => {
  const supabase = createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export type OwnProfile = {
  applicationStatus: string | null;
  applicationId: string | null;
  role: 'tenant' | 'owner';
  ownerName: string | null;
  stripeConnectAccountId: string | null;
  stripeConnectOnboarded: boolean;
};

export const getOwnProfile = cache(async (userId: string): Promise<OwnProfile | null> => {
  const supabase = createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('application_status, application_id, role, owner_name, stripe_connect_account_id, stripe_connect_onboarded')
    .eq('id', userId)
    .maybeSingle();
  if (!data) return null;
  return {
    applicationStatus: data.application_status,
    applicationId: data.application_id,
    role: data.role === 'owner' ? 'owner' : 'tenant',
    ownerName: data.owner_name,
    stripeConnectAccountId: data.stripe_connect_account_id,
    stripeConnectOnboarded: !!data.stripe_connect_onboarded,
  };
});
