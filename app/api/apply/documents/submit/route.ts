import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email.server';
import { documentsSubmittedNotificationEmailTemplate } from '@/lib/email-templates';
import { resolveSiteUrl } from '@/lib/site-url';

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
  const financialProofPath = typeof body?.financialProofPath === 'string' ? body.financialProofPath : null;
  const unpaidRentInsurancePath =
    typeof body?.unpaidRentInsurancePath === 'string' ? body.unpaidRentInsurancePath : null;
  const payslipPath = typeof body?.payslipPath === 'string' ? body.payslipPath : null;

  // Estudiante manda los dos, trabajador/a manda solo la nómina — ver
  // DocumentsUploadForm, que decide cuáles pedir según el perfil.
  const studentDocsSent = financialProofPath !== null && unpaidRentInsurancePath !== null;
  const workerDocsSent = payslipPath !== null;

  if (typeof applicationId !== 'string' || (!studentDocsSent && !workerDocsSent)) {
    return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 });
  }

  const { data: application } = await admin
    .from('applications')
    .select('id, name')
    .eq('id', applicationId)
    .maybeSingle();
  if (!application) return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 });

  const { error } = await admin
    .from('applications')
    .update({
      ...(studentDocsSent
        ? { financial_proof_path: financialProofPath, unpaid_rent_insurance_path: unpaidRentInsurancePath }
        : {}),
      ...(workerDocsSent ? { payslip_path: payslipPath } : {}),
      documents_submitted_at: new Date().toISOString(),
      // Un reenvío siempre supera un rechazo anterior: limpiamos la nota para
      // que no quede pegada a los documentos nuevos.
      documents_rejected_at: null,
      documents_rejection_note: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', application.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Best-effort: si Resend falla, los documentos ya quedaron guardados igual.
  try {
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (adminEmails.length > 0) {
      const siteUrl = resolveSiteUrl(request);
      const { subject, html } = documentsSubmittedNotificationEmailTemplate(
        application.name,
        `${siteUrl}/admin/solicitudes`
      );
      await sendEmail({ to: adminEmails, subject, html });
    }
  } catch {
    // best-effort, ver comentario arriba
  }

  return NextResponse.json({ ok: true });
}
