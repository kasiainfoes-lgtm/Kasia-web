import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Primera capa de defensa para el catálogo privado: si ni siquiera hay
  // sesión, ni vale la pena llegar a la página (que además vuelve a
  // comprobar la solicitud APPROVED en el servidor antes de renderizar nada).
  const isProtected =
    request.nextUrl.pathname.startsWith('/rooms') || request.nextUrl.pathname.startsWith('/reservar');
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

// Cada paso por el middleware hace una llamada a Supabase para resolver la
// sesión, así que las peticiones de archivos estáticos (fotos de las
// habitaciones, iconos, fuentes) no tienen por qué pasar por acá: no hay
// ninguna sesión que refrescar y solo agregan latencia a cada imagen.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|woff|woff2)$).*)',
  ],
};
