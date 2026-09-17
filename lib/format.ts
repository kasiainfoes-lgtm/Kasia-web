// Formato de fechas/números que no depende de los datos de idioma (ICU)
// instalados en el Node.js que los ejecuta. toLocaleDateString/toLocaleString
// SÍ dependen de eso: una build de Node con ICU recortado (habitual en
// instalaciones estándar de Ubuntu, como la del VPS) puede formatear
// distinto en el servidor que en el navegador para el mismo valor. En un
// Server Component eso hace que React detecte una hidratación fallida y
// descarte la página entera para volver a armarla del lado del cliente —
// se siente como que la página se traba. Usando componentes UTC de la
// fecha a mano, el resultado es siempre el mismo string en cualquier lado.

export function formatDateEs(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getUTCFullYear()}`;
}

export function formatDateTimeEs(iso: string): string {
  const d = new Date(iso);
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${formatDateEs(iso)}, ${hours}:${minutes}`;
}

export function formatEurEs(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
