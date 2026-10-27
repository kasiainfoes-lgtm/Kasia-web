import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/supabase/session.server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const body = await request.json().catch(() => ({}));
  const fullName = String(body?.fullName ?? '').trim();
  const companyName = String(body?.companyName ?? '').trim();
  const phone = String(body?.phone ?? '').trim();
  const address = String(body?.address ?? '').trim();

  const { error } = await admin.from('profiles').upsert(
    {
      id: user.id,
      full_name: fullName || null,
      company_name: companyName || null,
      phone: phone || null,
      address: address || null,
    },
    { onConflict: 'id' }
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
