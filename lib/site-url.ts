// Resuelve la URL pública del sitio para armar links de retorno (Stripe, Didit,
// emails). NEXT_PUBLIC_SITE_URL va primero porque detrás de un reverse proxy
// (nginx -> pm2 en el VPS) que no reenvía el Host original, request.url termina
// apuntando al host interno (localhost:3000) en vez del dominio público — eso
// es lo que rompía los links "localhost:3000/..." en los emails y hubiera roto
// también los redirects de Stripe. Si la variable de entorno no está seteada,
// caemos al Origin del navegador y, como último recurso, al host de la request.
export function resolveSiteUrl(request: Request): string {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const origin = request.headers.get('origin');
  if (origin) return origin;

  try {
    return new URL(request.url).origin;
  } catch {
    return '';
  }
}
