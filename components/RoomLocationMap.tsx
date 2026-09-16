'use client';

import dynamic from 'next/dynamic';

// react-leaflet toca `window` al importarse, así que no puede renderizarse en
// el servidor. La página de detalle de la habitación es un Server Component,
// que no puede pasar ssr:false directamente — este wrapper 'use client' es lo
// que lo permite (mismo patrón que Catalog.tsx usa para RoomsMap).
const RoomMiniMap = dynamic(() => import('@/components/RoomMiniMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-vivi-bg text-sm text-vivi-muted">
      Cargando mapa…
    </div>
  ),
});

export default function RoomLocationMap({ zone, lat, lng }: { zone: string; lat: number; lng: number }) {
  return <RoomMiniMap zone={zone} lat={lat} lng={lng} />;
}
