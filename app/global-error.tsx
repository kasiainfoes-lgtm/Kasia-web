'use client';

// Solo se dispara si el error ocurre en el propio layout raíz (Navbar/Footer
// incluidos) y no en el contenido de una página — ahí sí se ve app/error.tsx
// en su lugar, con el layout normal alrededor. Este reemplaza toda la página
// (incluido <html>), así que arma su propio HTML mínimo sin depender de
// Tailwind ni de nada que también pudiera estar fallando.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#F4F6F9' }}>
        <section style={{ maxWidth: 420, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#E5484D' }}>Kasia</p>
          <h1 style={{ marginTop: 8, fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Algo salió mal</h1>
          <p style={{ marginTop: 12, fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
            Tuvimos un problema al cargar la página. Probablemente fue algo pasajero — inténtalo de
            nuevo en un momento.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: '10px 24px',
              borderRadius: 12,
              background: '#0B1524',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </section>
      </body>
    </html>
  );
}
