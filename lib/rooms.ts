export type Room = {
  id: string;
  zone: string;
  title: string;
  price: number;
  match: number;
  available: string;
  individualOrPareja: 'individual' | 'pareja' | 'ambos';
  workerOrStudent: 'trabajador' | 'estudiante' | 'ambos';
  acceptsSmokers: boolean;
  acceptsPets: boolean;
  acceptsDogs: boolean;
  lat: number;
  lng: number;
  photos: number;
  photoUrls: string[];
  colorFrom: string;
  colorTo: string;
  amenities: string[];
  description: string;
  manager: string;
  responseTime: string;
  managerPhone: string;
  managerEmail: string;
};

export const MINIMUM_STAY_MONTHS = 6;

// Centro aproximado de cada barrio de Valencia. Se usa como ubicación por
// defecto en el mapa cuando una propiedad no tiene lat/lng propios cargados.
export const ZONE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Ruzafa: { lat: 39.4622, lng: -0.376 },
  Benimaclet: { lat: 39.486, lng: -0.3642 },
  Mestalla: { lat: 39.475, lng: -0.358 },
  'El Carmen': { lat: 39.4796, lng: -0.376 },
  Extramurs: { lat: 39.4743, lng: -0.386 },
  'Camins al Grau': { lat: 39.4683, lng: -0.3387 },
  Patraix: { lat: 39.4607, lng: -0.4003 },
  Algirós: { lat: 39.4773, lng: -0.3457 },
  Malvarrosa: { lat: 39.4753, lng: -0.3257 },
};

// Centro de Valencia, por si una zona no está en ZONE_COORDINATES.
const VALENCIA_CENTER = { lat: 39.4699, lng: -0.3763 };

export function roomCoordinates(room: Pick<Room, 'lat' | 'lng' | 'zone'>): { lat: number; lng: number } {
  if (room.lat && room.lng) return { lat: room.lat, lng: room.lng };
  return ZONE_COORDINATES[room.zone] ?? VALENCIA_CENTER;
}

// Se usan mientras no haya una tabla `properties` en Supabase configurada
// (o como semilla para cargarlas ahí). Ver SETUP.md para subir las tuyas
// sin código desde el editor de tablas de Supabase.
export const mockRooms: Room[] = [
  {
    id: 'ruzafa-3a',
    zone: 'Ruzafa',
    title: 'Habitación Premium con balcón',
    price: 750,
    match: 94,
    available: '01/10/2026',
    individualOrPareja: 'ambos',
    workerOrStudent: 'ambos',
    acceptsSmokers: true,
    acceptsPets: true,
    acceptsDogs: false,
    lat: 39.4622,
    lng: -0.376,
    photos: 12,
    photoUrls: [],
    colorFrom: '#BFD9FF',
    colorTo: '#DCE9FF',
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Escritorio', 'Lavadora', 'Ascensor', 'Balcón propio'],
    description:
      'Habitación exterior con balcón en un piso reformado a dos calles del Mercado de Ruzafa. Zona con más ambiente de bares y coworkings de la ciudad, ideal si trabajás remoto o estudiás cerca del centro.',
    manager: 'Alba',
    responseTime: 'Responde en menos de 2 horas',
    managerPhone: '+34 600 111 222',
    managerEmail: 'alba@kasia-valencia.com',
  },
  {
    id: 'benimaclet-1c',
    zone: 'Benimaclet',
    title: 'Habitación exterior junto al campus',
    price: 680,
    match: 89,
    available: '15/10/2026',
    individualOrPareja: 'individual',
    workerOrStudent: 'estudiante',
    acceptsSmokers: true,
    acceptsPets: true,
    acceptsDogs: false,
    lat: 39.486,
    lng: -0.3642,
    photos: 9,
    photoUrls: [],
    colorFrom: '#E4D9FF',
    colorTo: '#F0E9FF',
    amenities: ['WiFi de 300Mb', 'Escritorio', 'Lavadora', 'Terraza compartida'],
    description:
      'A diez minutos a pie de la Universitat de València y la Politècnica. Barrio tranquilo con huerta cerca, panaderías de toda la vida y buena conexión en metro hacia el centro.',
    manager: 'Marc',
    responseTime: 'Responde en menos de 4 horas',
    managerPhone: '+34 600 333 444',
    managerEmail: 'marc@kasia-valencia.com',
  },
  {
    id: 'mestalla-2b',
    zone: 'Mestalla',
    title: 'Habitación luminosa cerca del estadio',
    price: 720,
    match: 86,
    available: '01/11/2026',
    individualOrPareja: 'pareja',
    workerOrStudent: 'trabajador',
    acceptsSmokers: true,
    acceptsPets: true,
    acceptsDogs: false,
    lat: 39.475,
    lng: -0.358,
    photos: 10,
    photoUrls: [],
    colorFrom: '#BFEBE0',
    colorTo: '#DFF7EF',
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Lavadora', 'Ascensor'],
    description:
      'Piso con mucha luz natural en una calle tranquila detrás del Mestalla. Buena opción si trabajás en la zona norte de la ciudad o llegás en tren a Cabanyal-Alameda.',
    manager: 'Alba',
    responseTime: 'Responde en menos de 2 horas',
    managerPhone: '+34 600 111 222',
    managerEmail: 'alba@kasia-valencia.com',
  },
  {
    id: 'el-carmen-4d',
    zone: 'El Carmen',
    title: 'Habitación con encanto en el Carmen',
    price: 820,
    match: 82,
    available: '01/10/2026',
    individualOrPareja: 'ambos',
    workerOrStudent: 'ambos',
    acceptsSmokers: true,
    acceptsPets: true,
    acceptsDogs: false,
    lat: 39.4796,
    lng: -0.376,
    photos: 14,
    photoUrls: [],
    colorFrom: '#FFD9CF',
    colorTo: '#FFEAE4',
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Escritorio', 'Balcón propio', 'Ascensor'],
    description:
      'En pleno casco histórico, en un edificio del siglo XIX restaurado con techos altos y suelos originales. Todo el barrio a pie: Torres de Serranos, galerías de arte y las mejores terrazas.',
    manager: 'Nuria',
    responseTime: 'Responde en menos de 1 hora',
    managerPhone: '+34 600 555 666',
    managerEmail: 'nuria@kasia-valencia.com',
  },
  {
    id: 'extramurs-2a',
    zone: 'Extramurs',
    title: 'Habitación individual, piso tranquilo',
    price: 650,
    match: 91,
    available: '01/10/2026',
    individualOrPareja: 'individual',
    workerOrStudent: 'ambos',
    acceptsSmokers: true,
    acceptsPets: true,
    acceptsDogs: false,
    lat: 39.4743,
    lng: -0.386,
    photos: 8,
    photoUrls: [],
    colorFrom: '#D9E8FF',
    colorTo: '#EAF2FF',
    amenities: ['WiFi de 300Mb', 'Escritorio', 'Lavadora', 'Calefacción'],
    description:
      'Barrio residencial y bien conectado, a cinco paradas de metro del centro. Piso compartido con solo dos habitaciones, ambiente calmado, perfecto para teletrabajo.',
    manager: 'Marc',
    responseTime: 'Responde en menos de 4 horas',
    managerPhone: '+34 600 333 444',
    managerEmail: 'marc@kasia-valencia.com',
  },
  {
    id: 'camins-3c',
    zone: 'Camins al Grau',
    title: 'Habitación doble cerca de la playa',
    price: 770,
    match: 88,
    available: '20/10/2026',
    individualOrPareja: 'pareja',
    workerOrStudent: 'trabajador',
    acceptsSmokers: true,
    acceptsPets: true,
    acceptsDogs: false,
    lat: 39.4683,
    lng: -0.3387,
    photos: 11,
    photoUrls: [],
    colorFrom: '#FFE3B0',
    colorTo: '#FFF1D6',
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Lavadora', 'Terraza compartida', 'Ascensor'],
    description:
      'A quince minutos caminando de la playa de la Malvarrosa y cerca de la Ciudad de las Artes y las Ciencias. Ideal para parejas que buscan estabilidad y buen transporte al centro.',
    manager: 'Nuria',
    responseTime: 'Responde en menos de 1 hora',
    managerPhone: '+34 600 555 666',
    managerEmail: 'nuria@kasia-valencia.com',
  },
  {
    id: 'patraix-1b',
    zone: 'Patraix',
    title: 'Habitación económica, piso reformado',
    price: 660,
    match: 79,
    available: '05/11/2026',
    individualOrPareja: 'individual',
    workerOrStudent: 'ambos',
    acceptsSmokers: true,
    acceptsPets: true,
    acceptsDogs: false,
    lat: 39.4607,
    lng: -0.4003,
    photos: 7,
    photoUrls: [],
    colorFrom: '#D6F0E0',
    colorTo: '#EAF8EF',
    amenities: ['WiFi de 300Mb', 'Lavadora', 'Calefacción'],
    description:
      'Zona residencial con buen precio y todos los servicios cerca: supermercados, gimnasio y metro a diez minutos. Piso recién reformado con cocina y baño nuevos.',
    manager: 'Alba',
    responseTime: 'Responde en menos de 2 horas',
    managerPhone: '+34 600 111 222',
    managerEmail: 'alba@kasia-valencia.com',
  },
  {
    id: 'algiros-2d',
    zone: 'Algirós',
    title: 'Habitación junto a la Politècnica',
    price: 700,
    match: 90,
    available: '01/10/2026',
    individualOrPareja: 'individual',
    workerOrStudent: 'estudiante',
    acceptsSmokers: true,
    acceptsPets: true,
    acceptsDogs: false,
    lat: 39.4773,
    lng: -0.3457,
    photos: 9,
    photoUrls: [],
    colorFrom: '#E8DBFF',
    colorTo: '#F3ECFF',
    amenities: ['WiFi de 300Mb', 'Escritorio', 'Aire acondicionado', 'Ascensor'],
    description:
      'A cinco minutos de la Universitat Politècnica de València, en una zona con mucha vida estudiantil y buenas conexiones de bus y bici. Piso pensado para estudiar tranquilo.',
    manager: 'Marc',
    responseTime: 'Responde en menos de 4 horas',
    managerPhone: '+34 600 333 444',
    managerEmail: 'marc@kasia-valencia.com',
  },
  {
    id: 'malvarrosa-5a',
    zone: 'Malvarrosa',
    title: 'Habitación frente al mar',
    price: 830,
    match: 85,
    available: '10/10/2026',
    individualOrPareja: 'pareja',
    workerOrStudent: 'trabajador',
    acceptsSmokers: true,
    acceptsPets: true,
    acceptsDogs: false,
    lat: 39.4753,
    lng: -0.3257,
    photos: 13,
    photoUrls: [],
    colorFrom: '#C9EAFB',
    colorTo: '#E3F5FD',
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Balcón propio', 'Lavadora'],
    description:
      'A metros del paseo marítimo, con vistas parciales al mar desde la habitación. Ambiente relajado de barrio de playa, con el chiringuito y el paseo para correr a la puerta.',
    manager: 'Nuria',
    responseTime: 'Responde en menos de 1 hora',
    managerPhone: '+34 600 555 666',
    managerEmail: 'nuria@kasia-valencia.com',
  },
];

export function calculateBookingTotal(monthlyPrice: number) {
  const deposit = monthlyPrice;
  return { deposit, total: deposit };
}

// Compara la política de una habitación (fumadores/mascotas/perros) contra el
// perfil de quien pregunta. Se usa tanto para calcular si hay disponibilidad
// real al completar /apply como para filtrar qué habitaciones ve cada
// usuario ya aprobado en /rooms.
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm']);

// photoUrls puede mezclar fotos y videos subidos desde /admin/propiedades —
// se distinguen por extensión para saber si renderizar <img> o <video>.
export function isVideoUrl(url: string): boolean {
  const extension = url.split('?')[0].split('.').pop()?.toLowerCase();
  return !!extension && VIDEO_EXTENSIONS.has(extension);
}

// Para miniaturas (tarjeta de catálogo, listado de admin) que solo pueden
// mostrar una imagen fija: la primera foto real, saltando los videos.
export function firstImageUrl(urls: string[]): string | undefined {
  return urls.find((url) => !isVideoUrl(url));
}

export function roomAcceptsProfile(
  room: Room,
  profile: { smoker: boolean; petType: 'ninguno' | 'perro' | 'gato' | 'otro' }
): boolean {
  if (profile.smoker && !room.acceptsSmokers) return false;
  if (profile.petType !== 'ninguno' && !room.acceptsPets) return false;
  if (profile.petType === 'perro' && !room.acceptsDogs) return false;
  return true;
}
