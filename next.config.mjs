/** @type {import('next').NextConfig} */

// El optimizador de <Image> solo acepta imágenes de dominios declarados acá.
// Se deriva del propio NEXT_PUBLIC_SUPABASE_URL para que funcione con
// cualquier proyecto sin tocar este archivo, y se deja el comodín de
// supabase.co como respaldo si la variable no estuviera cargada al compilar.
const remotePatterns = [
  { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const { protocol, hostname } = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: protocol.replace(':', ''),
      hostname,
      pathname: '/storage/v1/object/public/**',
    });
  } catch {
    // URL inválida: queda solo el comodín de arriba.
  }
}

const nextConfig = {
  images: {
    remotePatterns,
    // Las fotos de una habitación no cambian una vez subidas: que el navegador
    // y el caché en disco las reusen un mes en vez de volver a pedirlas.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Sin los tamaños gigantes (2048/3840) que ninguna pantalla de este sitio
    // usa: cada uno es una redimensión más que el VPS tendría que calcular.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};

export default nextConfig;
