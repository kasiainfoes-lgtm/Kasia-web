import { createAdminClient } from '@/lib/supabase/admin';

export type AppSettings = {
  stripeSecretKey: string | null;
  diditApiKey: string | null;
  diditWorkflowId: string | null;
};

// Las claves se pueden cargar desde /admin/integraciones (quedan en la tabla
// app_settings) o como variables de entorno de siempre — lo que esté cargado
// en la base de datos gana, así el equipo no depende de tocar Netlify/Vercel.
export async function getAppSettings(): Promise<AppSettings> {
  const admin = createAdminClient();
  if (!admin) return { stripeSecretKey: null, diditApiKey: null, diditWorkflowId: null };

  const { data } = await admin.from('app_settings').select('*').eq('id', 1).single();
  return {
    stripeSecretKey: data?.stripe_secret_key || null,
    diditApiKey: data?.didit_api_key || null,
    diditWorkflowId: data?.didit_workflow_id || null,
  };
}

export async function resolveStripeSecretKey(): Promise<string | null> {
  const settings = await getAppSettings();
  return settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY || null;
}

export async function resolveDiditConfig(): Promise<{ apiKey: string | null; workflowId: string | null }> {
  const settings = await getAppSettings();
  return {
    apiKey: settings.diditApiKey || process.env.DIDIT_API_KEY || null,
    workflowId: settings.diditWorkflowId || process.env.DIDIT_WORKFLOW_ID || null,
  };
}
