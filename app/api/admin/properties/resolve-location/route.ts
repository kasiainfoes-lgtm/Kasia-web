import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/require-admin.server';
import { validateCoordinates } from '@/lib/property-input';

// Enlaces de Google Maps guardan la ubicación de varias formas según de dónde
// se copien. Se prueban de la más precisa (el pin exacto de un lugar) a la
// más general (el centro del mapa visible).
const COORD_PATTERNS = [/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/];

function extractLatLng(url: string): { lat: number; lng: number } | null {
  for (const pattern of COORD_PATTERNS) {
    const match = url.match(pattern);
    if (match) return { lat: Number(match[1]), lng: Number(match[2]) };
  }
  return null;
}

function isGoogleMapsHost(hostname: string): boolean {
  return hostname === 'goo.gl' || hostname.endsWith('.goo.gl') || hostname === 'google.com' || hostname.endsWith('.google.com');
}

// Los links cortos que da la app de Google Maps al compartir ("maps.app.goo.gl/...")
// no llevan coordenadas: solo aparecen después de seguir la redirección.
function isShortLinkHost(hostname: string): boolean {
  return hostname === 'goo.gl' || hostname.endsWith('.goo.gl');
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { url } = await request.json().catch(() => ({ url: null }));
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Pegá un link de Google Maps.' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Ese texto no es un link válido.' }, { status: 400 });
  }

  if (!isGoogleMapsHost(parsed.hostname)) {
    return NextResponse.json({ error: 'Tiene que ser un link de Google Maps (google.com/maps o maps.app.goo.gl).' }, { status: 400 });
  }

  let coords = extractLatLng(url);

  if (!coords && isShortLinkHost(parsed.hostname)) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      coords = extractLatLng(res.url);
    } catch {
      return NextResponse.json({ error: 'No pudimos abrir ese link. Probá pegar el link completo en vez del corto.' }, { status: 502 });
    }
  }

  if (!coords) {
    return NextResponse.json(
      { error: 'No encontramos coordenadas en ese link. Abrí el lugar en Google Maps, tocá "Compartir" y pegá ese link, o cargá latitud/longitud a mano.' },
      { status: 422 }
    );
  }

  const coordError = validateCoordinates(coords.lat, coords.lng);
  if (coordError) return NextResponse.json({ error: coordError }, { status: 422 });

  return NextResponse.json({ lat: coords.lat, lng: coords.lng });
}
