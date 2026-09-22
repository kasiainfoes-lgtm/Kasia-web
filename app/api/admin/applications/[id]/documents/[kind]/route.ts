import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'application-documents';

// Genera un link firmado de corta duración para que un admin pueda ver un
// documento del bucket privado. Nunca se expone la ruta cruda al navegador.
export async function GET(request: Request, { params }: { params: { id: string; kind: string } }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const VALID_KINDS = ['financial-proof', 'unpaid-rent-insurance', 'payslip'] as const;
  if (!VALID_KINDS.includes(params.kind as (typeof VALID_KINDS)[number])) {
    return NextResponse.json({ error: 'Tipo de documento inválido.' }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const { data: application } = await admin
    .from('applications')
    .select('financial_proof_path, unpaid_rent_insurance_path, payslip_path')
    .eq('id', params.id)
    .maybeSingle();

  const path =
    params.kind === 'financial-proof'
      ? application?.financial_proof_path
      : params.kind === 'unpaid-rent-insurance'
        ? application?.unpaid_rent_insurance_path
        : application?.payslip_path;
  if (!path) return NextResponse.json({ error: 'Documento no encontrado.' }, { status: 404 });

  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 300);
  if (error || !data) return NextResponse.json({ error: 'No pudimos generar el enlace.' }, { status: 500 });

  return NextResponse.redirect(data.signedUrl);
}
