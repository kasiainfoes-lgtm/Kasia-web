import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Guarda en la solicitud los documentos que la persona sube desde
// /apply/documents (tanto el paso de estudiante en /apply como el enlace que
// se manda por email cuando un admin pide más información). No requiere
// sesión: el id de la solicitud funciona como enlace de acceso, igual que la
// cookie que ya se usa en el resto del flujo de /apply.
export async function POST(request: Request) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const body = await request.json().catch(() => null);
  const applicationId = body?.applicationId;
  const financialProofPath = body?.financialProofPath;
  const unpaidRentInsurancePath = body?.unpaidRentInsurancePath;

  if (
    typeof applicationId !== 'string' ||
    typeof financialProofPath !== 'string' ||
    typeof unpaidRentInsurancePath !== 'string'
  ) {
    return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
  }

  const { data: application } = await admin
    .from('applications')
    .select('id')
    .eq('id', applicationId)
    .maybeSingle();
  if (!application) return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 });

  const { error } = await admin
    .from('applications')
    .update({
      financial_proof_path: financialProofPath,
      unpaid_rent_insurance_path: unpaidRentInsurancePath,
      documents_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', application.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
