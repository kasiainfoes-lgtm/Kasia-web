import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getApplicationById } from '@/lib/applications.server';
import { sendEmail } from '@/lib/email.server';
import {
  approvedEmailTemplate,
  documentsRejectedEmailTemplate,
  moreInfoEmailTemplate,
  rejectedEmailTemplate,
} from '@/lib/email-templates';
import { resolveSiteUrl } from '@/lib/site-url';

const ACTIONS = ['approve', 'reject', 'request-info', 'approve-documents', 'reject-documents'] as const;
type Action = (typeof ACTIONS)[number];

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const body = await request.json().catch(() => null);
  const action = body?.action as Action;
  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 });
  }

  const application = await getApplicationById(params.id);
  if (!application) return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 });

  const siteUrl = resolveSiteUrl(request);

  if (action === 'approve') {
    const { error } = await admin
      .from('applications')
      .update({ status: 'APPROVED', internal_reason: null, updated_at: new Date().toISOString() })
      .eq('id', application.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { subject, html } = approvedEmailTemplate(application.name, `${siteUrl}/signup?app=${application.id}`);
    const sent = await sendEmail({ to: application.email, subject, html });
    return NextResponse.json({ ok: true, emailSent: sent.ok, emailError: sent.error });
  }

  if (action === 'reject') {
    const { error } = await admin
      .from('applications')
      .update({ status: 'REJECTED', internal_reason: null, updated_at: new Date().toISOString() })
      .eq('id', application.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { subject, html } = rejectedEmailTemplate(application.name);
    const sent = await sendEmail({ to: application.email, subject, html });
    return NextResponse.json({ ok: true, emailSent: sent.ok, emailError: sent.error });
  }

  if (action === 'approve-documents') {
    const { error } = await admin
      .from('applications')
      .update({
        documents_approved_at: new Date().toISOString(),
        documents_rejected_at: null,
        documents_rejection_note: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', application.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'reject-documents') {
    const note = typeof body?.note === 'string' ? body.note.trim() : '';
    if (!note) return NextResponse.json({ error: 'Escribe una nota explicando qué corregir.' }, { status: 400 });

    const { error } = await admin
      .from('applications')
      .update({
        documents_rejected_at: new Date().toISOString(),
        documents_rejection_note: note,
        documents_approved_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', application.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { subject, html } = documentsRejectedEmailTemplate(
      application.name,
      note,
      `${siteUrl}/apply/documents?app=${application.id}`
    );
    const sent = await sendEmail({ to: application.email, subject, html });
    return NextResponse.json({ ok: true, emailSent: sent.ok, emailError: sent.error });
  }

  const { error } = await admin
    .from('applications')
    .update({ documents_requested_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', application.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { subject, html } = moreInfoEmailTemplate(
    application.name,
    `${siteUrl}/apply/documents?app=${application.id}`,
    application.occupationType ?? 'trabajador'
  );
  const sent = await sendEmail({ to: application.email, subject, html });
  return NextResponse.json({ ok: true, emailSent: sent.ok, emailError: sent.error });
}
