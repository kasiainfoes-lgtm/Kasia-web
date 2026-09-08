function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapper(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#F4F6FB;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="background:#0B1B3B;padding:24px 32px;">
          <span style="color:#22D3AA;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;">Kasia</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:20px;color:#0B1B3B;">${title}</h1>
          ${bodyHtml}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function approvedEmailTemplate(name: string, signupUrl: string) {
  const safeName = escapeHtml(name);
  return {
    subject: '¡Bienvenido/a a Kasia! Tu perfil fue aprobado',
    html: wrapper(
      '¡Buenas noticias!',
      `<p style="margin:0 0 16px;color:#3A4356;font-size:14px;line-height:1.6;">Hola ${safeName},</p>
       <p style="margin:0 0 24px;color:#3A4356;font-size:14px;line-height:1.6;">
         Hemos revisado tu perfil y ha quedado <strong>aprobado</strong>. Ya puedes crear tu cuenta y ver
         las habitaciones disponibles para tu búsqueda.
       </p>
       <a href="${signupUrl}" style="display:inline-block;background:#22D3AA;color:#0B1B3B;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;">
         Crear mi cuenta
       </a>`
    ),
  };
}

export function moreInfoEmailTemplate(name: string, uploadUrl: string) {
  const safeName = escapeHtml(name);
  return {
    subject: 'Necesitamos un poco más de información — Kasia',
    html: wrapper(
      'Necesitamos un poco más de información',
      `<p style="margin:0 0 16px;color:#3A4356;font-size:14px;line-height:1.6;">Hola ${safeName},</p>
       <p style="margin:0 0 24px;color:#3A4356;font-size:14px;line-height:1.6;">
         Antes de seguir con tu solicitud necesitamos que nos envíes tu <strong>seguro de impago</strong>
         y tu <strong>nómina</strong>. Puedes subirlos de forma segura desde este enlace:
       </p>
       <a href="${uploadUrl}" style="display:inline-block;background:#0B1B3B;color:#ffffff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;">
         Subir documentación
       </a>`
    ),
  };
}
