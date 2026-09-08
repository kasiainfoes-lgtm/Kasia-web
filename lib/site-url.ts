// Resuelve la URL pública del sitio para armar links de retorno (Stripe, Didit).
// Antes solo mirábamos el header Origin, que el navegador no siempre manda —
// si faltaba, la URL de vuelta quedaba relativa ("/reservar/...") y Stripe la
// rechazaba. request.url siempre trae el host real que recibió la petición.
export function resolveSiteUrl(request: Request): string {
  try {
    const fromRequest = new URL(request.url).origin;
    if (fromRequest) return fromRequest;
  } catch {
    // sigue al siguiente fallback
  }
  const origin = request.headers.get('origin');
  if (origin) return origin;
  return (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
}
