import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'payment-proofs';

// Genera un link firmado de corta duración para que un admin pueda ver el
// comprobante del bucket privado. Nunca se expone la ruta cruda al navegador.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: 'Supabase no está configurado.' }, { status: 501 });

  const { data: booking } = await admin
    .from('bookings')
    .select('transfer_proof_path')
    .eq('id', params.id)
    .maybeSingle();

  if (!booking?.transfer_proof_path) {
    return NextResponse.json({ error: 'Comprobante no encontrado.' }, { status: 404 });
  }

  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(booking.transfer_proof_path, 300);
  if (error || !data) return NextResponse.json({ error: 'No pudimos generar el enlace.' }, { status: 500 });

  return NextResponse.redirect(data.signedUrl);
}
