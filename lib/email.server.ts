import { resolveResendConfig } from '@/lib/settings.server';

export type SendEmailResult = { ok: boolean; error?: string };

// Usa la API de Resend directo por fetch (sin agregar su SDK como dependencia).
// La clave y el remitente se resuelven igual que Stripe/Didit: primero lo
// cargado desde /admin/integraciones, si no lo que haya en variables de entorno.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const { apiKey, from } = await resolveResendConfig();
  if (!apiKey || !from) {
    return { ok: false, error: 'El envío de emails no está configurado todavía (ver /admin/integraciones).' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, error: body?.message || `Resend respondió con estado ${res.status}.` };
  }

  return { ok: true };
}
