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
  photoUrls: string[];
  amenities: string[];
  description: string;
  manager: string;
  responseTime: string;
  managerPhone: string;
  managerEmail: string;
  published: boolean;
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

function isValidCoordinate(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// La zona de cada propiedad es texto libre en /admin/propiedades, así que
// "Malvarrosa", "Malva-Rosa" y "Malva Rosa" terminan siendo tres strings
// distintos aunque sean el mismo barrio — y no alcanza con solo sacar el
// guion: "Malvarrosa" lleva doble r (como palabra compuesta) pero al
// escribirla separada ("Malva Rosa") la gente tipea una sola, así que
// además de sacar espacios/guiones se colapsan letras repetidas seguidas.
// Se usa para comparar/agrupar zonas, nunca para lo que se muestra en
// pantalla, solo para decidir si dos zonas son "la misma".
export function normalizeZoneKey(zone: string): string {
  return zone
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '')
    .replace(/(.)\1+/g, '$1');
}

const ZONE_COORDINATES_BY_KEY = new Map(
  Object.entries(ZONE_COORDINATES).map(([zone, coords]) => [normalizeZoneKey(zone), coords])
);

// Zonas que existen de verdad en el catálogo, agrupadas por zona
// normalizada (ver normalizeZoneKey) y en el orden en que aparecen. Se usa
// tanto para las pills del catálogo como para el desplegable de /apply: una
// zona sin ninguna propiedad cargada no aparece como opción, y en cuanto se
// carga la primera ahí sí aparece sola.
export function uniqueZones(rooms: Pick<Room, 'zone'>[]): string[] {
  const seen = new Map<string, string>();
  for (const room of rooms) {
    const key = normalizeZoneKey(room.zone);
    if (!seen.has(key)) seen.set(key, room.zone);
  }
  return Array.from(seen.values());
}

export function roomCoordinates(room: Pick<Room, 'lat' | 'lng' | 'zone'>): { lat: number; lng: number } {
  if (room.lat && room.lng && isValidCoordinate(room.lat, room.lng)) return { lat: room.lat, lng: room.lng };
  return ZONE_COORDINATES_BY_KEY.get(normalizeZoneKey(room.zone)) ?? VALENCIA_CENTER;
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
    photoUrls: [],
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Escritorio', 'Lavadora', 'Ascensor', 'Balcón propio'],
    description:
      'Habitación exterior con balcón en un piso reformado a dos calles del Mercado de Ruzafa. Zona con más ambiente de bares y coworkings de la ciudad, ideal si trabajás remoto o estudiás cerca del centro.',
    manager: 'Alba',
    responseTime: 'Responde en menos de 2 horas',
    managerPhone: '+34 600 111 222',
    managerEmail: 'alba@kasia-valencia.com',
    published: true,
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
    photoUrls: [],
    amenities: ['WiFi de 300Mb', 'Escritorio', 'Lavadora', 'Terraza compartida'],
    description:
      'A diez minutos a pie de la Universitat de València y la Politècnica. Barrio tranquilo con huerta cerca, panaderías de toda la vida y buena conexión en metro hacia el centro.',
    manager: 'Marc',
    responseTime: 'Responde en menos de 4 horas',
    managerPhone: '+34 600 333 444',
    managerEmail: 'marc@kasia-valencia.com',
    published: true,
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
    photoUrls: [],
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Lavadora', 'Ascensor'],
    description:
      'Piso con mucha luz natural en una calle tranquila detrás del Mestalla. Buena opción si trabajás en la zona norte de la ciudad o llegás en tren a Cabanyal-Alameda.',
    manager: 'Alba',
    responseTime: 'Responde en menos de 2 horas',
    managerPhone: '+34 600 111 222',
    managerEmail: 'alba@kasia-valencia.com',
    published: true,
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
    photoUrls: [],
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Escritorio', 'Balcón propio', 'Ascensor'],
    description:
      'En pleno casco histórico, en un edificio del siglo XIX restaurado con techos altos y suelos originales. Todo el barrio a pie: Torres de Serranos, galerías de arte y las mejores terrazas.',
    manager: 'Nuria',
    responseTime: 'Responde en menos de 1 hora',
    managerPhone: '+34 600 555 666',
    managerEmail: 'nuria@kasia-valencia.com',
    published: true,
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
    photoUrls: [],
    amenities: ['WiFi de 300Mb', 'Escritorio', 'Lavadora', 'Calefacción'],
    description:
      'Barrio residencial y bien conectado, a cinco paradas de metro del centro. Piso compartido con solo dos habitaciones, ambiente calmado, perfecto para teletrabajo.',
    manager: 'Marc',
    responseTime: 'Responde en menos de 4 horas',
    managerPhone: '+34 600 333 444',
    managerEmail: 'marc@kasia-valencia.com',
    published: true,
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
    photoUrls: [],
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Lavadora', 'Terraza compartida', 'Ascensor'],
    description:
      'A quince minutos caminando de la playa de la Malvarrosa y cerca de la Ciudad de las Artes y las Ciencias. Ideal para parejas que buscan estabilidad y buen transporte al centro.',
    manager: 'Nuria',
    responseTime: 'Responde en menos de 1 hora',
    managerPhone: '+34 600 555 666',
    managerEmail: 'nuria@kasia-valencia.com',
    published: true,
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
    photoUrls: [],
    amenities: ['WiFi de 300Mb', 'Lavadora', 'Calefacción'],
    description:
      'Zona residencial con buen precio y todos los servicios cerca: supermercados, gimnasio y metro a diez minutos. Piso recién reformado con cocina y baño nuevos.',
    manager: 'Alba',
    responseTime: 'Responde en menos de 2 horas',
    managerPhone: '+34 600 111 222',
    managerEmail: 'alba@kasia-valencia.com',
    published: true,
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
    photoUrls: [],
    amenities: ['WiFi de 300Mb', 'Escritorio', 'Aire acondicionado', 'Ascensor'],
    description:
      'A cinco minutos de la Universitat Politècnica de València, en una zona con mucha vida estudiantil y buenas conexiones de bus y bici. Piso pensado para estudiar tranquilo.',
    manager: 'Marc',
    responseTime: 'Responde en menos de 4 horas',
    managerPhone: '+34 600 333 444',
    managerEmail: 'marc@kasia-valencia.com',
    published: true,
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
    photoUrls: [],
    amenities: ['WiFi de 300Mb', 'Aire acondicionado', 'Balcón propio', 'Lavadora'],
    description:
      'A metros del paseo marítimo, con vistas parciales al mar desde la habitación. Ambiente relajado de barrio de playa, con el chiringuito y el paseo para correr a la puerta.',
    manager: 'Nuria',
    responseTime: 'Responde en menos de 1 hora',
    managerPhone: '+34 600 555 666',
    managerEmail: 'nuria@kasia-valencia.com',
    published: true,
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

// Mismo margen de presupuesto que se usa al evaluar /apply (lib/application-scoring.ts).
const MATCH_BUDGET_TOLERANCE_EUR = 100;

// El "% de compatibilidad" que ve cada persona ya no lo tipea quien carga la
// propiedad — se calcula acá, comparando lo que pidió en /apply contra lo
// que ofrece esta habitación en concreto. Mismos cuatro factores que deciden
// si una solicitud queda NOT_ELIGIBLE (zona, ocupación, fumador/mascota,
// presupuesto), pero como puntaje continuo en vez de sí/no.
export function calculateMatchPercent(
  room: Room,
  answers: {
    zone: string;
    occupancyType: 'individual' | 'pareja';
    petType: 'ninguno' | 'perro' | 'gato' | 'otro';
    smoker: boolean;
    budget: number;
  }
): number {
  let score = 100;

  if (answers.zone !== 'Cualquier zona' && normalizeZoneKey(room.zone) !== normalizeZoneKey(answers.zone)) {
    score -= 20;
  }
  if (answers.occupancyType === 'pareja' && room.individualOrPareja === 'individual') {
    score -= 20;
  }
  if (!roomAcceptsProfile(room, { smoker: answers.smoker, petType: answers.petType })) {
    score -= 30;
  }
  if (room.price > answers.budget + MATCH_BUDGET_TOLERANCE_EUR) {
    score -= 30;
  } else if (room.price > answers.budget) {
    score -= 15;
  }

  return Math.max(0, score);
}
