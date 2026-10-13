import { createClient } from '@/lib/supabase/server';
import { mockRooms, roomCoordinates, type Room } from '@/lib/rooms';

function mapSupabaseRow(row: any): Room {
  const { lat, lng } = roomCoordinates({ lat: row.lat, lng: row.lng, zone: row.zone });
  return {
    id: row.id,
    zone: row.zone,
    title: row.title,
    price: Number(row.price),
    match: row.match ?? 90,
    available: row.available,
    individualOrPareja: row.individual_or_pareja ?? 'ambos',
    workerOrStudent: row.worker_or_student ?? 'ambos',
    acceptsSmokers: row.accepts_smokers ?? true,
    acceptsPets: row.accepts_pets ?? true,
    acceptsDogs: row.accepts_dogs ?? false,
    lat,
    lng,
    photoUrls: row.photo_urls ?? [],
    colorFrom: row.color_from ?? '#BFD9FF',
    colorTo: row.color_to ?? '#DCE9FF',
    amenities: row.amenities ?? [],
    description: row.description ?? '',
    manager: row.manager ?? 'Equipo Kasia',
    responseTime: row.response_time ?? 'Responde en menos de 24 horas',
    managerPhone: row.manager_phone ?? '+34 600 000 000',
    managerEmail: row.manager_email ?? 'hola@kasia-valencia.com',
    published: row.published ?? true,
  };
}

// mockRooms son datos de demostración con asesoras y teléfonos inventados, así
// que solo se usan cuando Supabase todavía no está configurado. Con Supabase
// conectado, una tabla vacía significa "no hay habitaciones", no "mostrá las de
// ejemplo": si no, borrar el catálogo hacía reaparecer las falsas.
export async function fetchRooms(): Promise<Room[]> {
  const supabase = createClient();
  if (!supabase) return mockRooms;

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data.map(mapSupabaseRow);
}

// Para todo lo que ve un cliente (catálogo, /apply, página de un asesor):
// una propiedad oculta ("published = false") sigue existiendo y el admin
// la sigue viendo en /admin/propiedades, pero no cuenta como disponible
// para nadie más — ver la palanca de publicar/ocultar ahí.
export async function fetchPublishedRooms(): Promise<Room[]> {
  const rooms = await fetchRooms();
  return rooms.filter((room) => room.published);
}

export async function fetchRoomById(id: string): Promise<Room | undefined> {
  const supabase = createClient();
  if (!supabase) return mockRooms.find((room) => room.id === id);

  const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
  if (error || !data) return undefined;
  return mapSupabaseRow(data);
}

// Todas las habitaciones que gestiona un mismo asesor (identificado por su
// email) — para la página "todas las propiedades de David", al estilo del
// perfil de un anfitrión en Airbnb.
export async function fetchRoomsByManagerEmail(managerEmail: string): Promise<Room[]> {
  const rooms = await fetchPublishedRooms();
  return rooms.filter((room) => room.managerEmail === managerEmail);
}
