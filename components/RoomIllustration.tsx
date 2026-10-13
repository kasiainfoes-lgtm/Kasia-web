// Ilustraciones simples (SVG propio, sin depender de ningún banco de
// imágenes externo) para que las tarjetas de ejemplo de la home no se vean
// vacías con solo un degradé — tres variantes distintas para que las tres
// tarjetas de muestra no sean todas iguales.
type Variant = 'window' | 'plant' | 'lamp';

function GradientBg({ id, colorFrom, colorTo }: { id: string; colorFrom: string; colorTo: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colorFrom} />
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#${id})`} />
    </>
  );
}

function BedShape() {
  return (
    <g>
      <rect x="40" y="128" width="190" height="52" rx="10" fill="#0B1524" fillOpacity="0.14" />
      <rect x="40" y="110" width="190" height="34" rx="10" fill="#FFFFFF" fillOpacity="0.85" />
      <rect x="52" y="96" width="46" height="30" rx="8" fill="#FFFFFF" />
      <rect x="104" y="96" width="46" height="30" rx="8" fill="#FFFFFF" />
      <rect x="34" y="92" width="10" height="92" rx="5" fill="#0B1524" fillOpacity="0.2" />
    </g>
  );
}

function WindowVariant() {
  return (
    <>
      <BedShape />
      <g opacity="0.9">
        <rect x="266" y="36" width="96" height="104" rx="6" fill="#FFFFFF" fillOpacity="0.55" />
        <rect x="266" y="36" width="96" height="104" rx="6" fill="none" stroke="#0B1524" strokeOpacity="0.25" strokeWidth="4" />
        <line x1="314" y1="36" x2="314" y2="140" stroke="#0B1524" strokeOpacity="0.25" strokeWidth="4" />
        <line x1="266" y1="88" x2="362" y2="88" stroke="#0B1524" strokeOpacity="0.25" strokeWidth="4" />
        <path d="M262 36 Q244 70 262 140" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" opacity="0.8" />
      </g>
    </>
  );
}

function PlantVariant() {
  return (
    <>
      <BedShape />
      <g>
        <ellipse cx="320" cy="186" rx="52" ry="10" fill="#0B1524" fillOpacity="0.1" />
        <path d="M312 150 C300 130 300 110 312 94" fill="none" stroke="#0B1524" strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
        <path d="M320 150 C320 122 320 100 320 84" fill="none" stroke="#0B1524" strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
        <path d="M328 150 C340 128 342 108 330 92" fill="none" stroke="#0B1524" strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
        <path d="M296 150 L344 150 L336 180 L304 180 Z" fill="#FFFFFF" fillOpacity="0.85" />
      </g>
    </>
  );
}

function LampVariant() {
  return (
    <>
      <BedShape />
      <g>
        <rect x="250" y="150" width="46" height="34" rx="6" fill="#FFFFFF" fillOpacity="0.85" />
        <line x1="273" y1="150" x2="273" y2="96" stroke="#0B1524" strokeOpacity="0.3" strokeWidth="4" />
        <path d="M252 96 L294 96 L286 68 L260 68 Z" fill="#FFFFFF" />
        <rect x="312" y="60" width="54" height="70" rx="4" fill="#FFFFFF" fillOpacity="0.55" />
        <rect x="312" y="60" width="54" height="70" rx="4" fill="none" stroke="#0B1524" strokeOpacity="0.2" strokeWidth="3" />
      </g>
    </>
  );
}

export default function RoomIllustration({
  variant,
  colorFrom,
  colorTo,
  id,
}: {
  variant: Variant;
  colorFrom: string;
  colorTo: string;
  id: string;
}) {
  // "El Carmen" tenía un espacio, que es un id de SVG inválido para un
  // url(#id) — el navegador no podía resolver el degradé y pintaba la
  // tarjeta negra en vez del color real.
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '-');
  return (
    <svg viewBox="0 0 400 220" className="h-36 w-full rounded-xl" preserveAspectRatio="xMidYMax slice">
      <GradientBg id={safeId} colorFrom={colorFrom} colorTo={colorTo} />
      {variant === 'window' && <WindowVariant />}
      {variant === 'plant' && <PlantVariant />}
      {variant === 'lamp' && <LampVariant />}
    </svg>
  );
}
