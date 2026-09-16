import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchRoomById } from '@/lib/properties.server';
import { calculateBookingTotal } from '@/lib/rooms';
import { sendEmail } from '@/lib/email.server';
import { paymentConfirmedEmailTemplate, transferProofRejectedEmailTemplate } from '@/lib/email-templates';
import { resolveSiteUrl } from '@/lib/site-url';

const ACTIONS = ['approve-transfer', 'reject-transfer'] as const;
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

  const { data: booking } = await admin.from('bookings').select('*').eq('id', params.id).maybeSingle();
  if (!booking) return NextResponse.json({ error: 'Reserva no encontrada.' }, { status: 404 });

  const room = await fetchRoomById(booking.room_id);
  const siteUrl = resolveSiteUrl(request);

  if (action === 'approve-transfer') {
    const { deposit } = calculateBookingTotal(room?.price ?? 0);
    const { error } = await admin
      .from('bookings')
      .update({
        status: 'pagado',
        amount: deposit,
        paid_at: new Date().toISOString(),
        transfer_review_rejected_at: null,
        transfer_review_rejection_note: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (!booking.user_email || !room) return NextResponse.json({ ok: true, emailSent: false });
    const { subject, html } = paymentConfirmedEmailTemplate(room.title, deposit);
    const sent = await sendEmail({ to: booking.user_email, subject, html });
    return NextResponse.json({ ok: true, emailSent: sent.ok, emailError: sent.error });
  }

  const note = typeof body?.note === 'string' ? body.note.trim() : '';
  if (!note) return NextResponse.json({ error: 'Escribe una nota explicando qué corregir.' }, { status: 400 });

  // Vuelve a 'verificado' (identidad + condiciones ya aceptadas) para que la
  // persona pueda subir un comprobante nuevo sin repetir todo el wizard.
  const { error } = await admin
    .from('bookings')
    .update({
      status: 'verificado',
      transfer_proof_path: null,
      transfer_review_rejected_at: new Date().toISOString(),
      transfer_review_rejection_note: note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!booking.user_email || !room) return NextResponse.json({ ok: true, emailSent: false });
  const { subject, html } = transferProofRejectedEmailTemplate(note, room.title, `${siteUrl}/reservar/${room.id}`);
  const sent = await sendEmail({ to: booking.user_email, subject, html });
  return NextResponse.json({ ok: true, emailSent: sent.ok, emailError: sent.error });
}
