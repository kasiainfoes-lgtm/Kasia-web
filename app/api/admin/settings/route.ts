import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAppSettings } from '@/lib/settings.server';
import { maskSecret } from '@/lib/mask';

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const settings = await getAppSettings();
  return NextResponse.json({
    stripeConfigured: !!(settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY),
    stripeKeyMasked: maskSecret(settings.stripeSecretKey),
    diditConfigured: !!(
      (settings.diditApiKey || process.env.DIDIT_API_KEY) &&
      (settings.diditWorkflowId || process.env.DIDIT_WORKFLOW_ID)
    ),
    diditApiKeyMasked: maskSecret(settings.diditApiKey),
    diditWorkflowId: settings.diditWorkflowId ?? '',
  });
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const body = await request.json();
  const update: Record<string, string> = { updated_at: new Date().toISOString() };
  if (typeof body.stripeSecretKey === 'string' && body.stripeSecretKey.trim()) {
    update.stripe_secret_key = body.stripeSecretKey.trim();
  }
  if (typeof body.diditApiKey === 'string' && body.diditApiKey.trim()) {
    update.didit_api_key = body.diditApiKey.trim();
  }
  if (typeof body.diditWorkflowId === 'string' && body.diditWorkflowId.trim()) {
    update.didit_workflow_id = body.diditWorkflowId.trim();
  }

  const { error } = await admin.from('app_settings').update(update).eq('id', 1);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
