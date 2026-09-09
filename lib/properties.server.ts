import { createClient } from '@/lib/supabase/server';
import { mockRooms, type Room } from '@/lib/rooms';

function mapSupabaseRow(row: any): Room {
  return {
    id: row.id,
    zone: row.zone,
    title: row.title,
    price: Number(row.price),
    match: row.match ?? 90,
    available: row.available,
    individualOrPareja: row.individual_or_pareja ?? 'ambos',
    workerOrStudent: row.worker_or_student ?? 'ambos',
    photos: row.photos ?? 1,
    photoUrls: row.photo_urls ?? [],
    colorFrom: row.color_from ?? '#BFD9FF',
    colorTo: row.color_to ?? '#DCE9FF',
    amenities: row.amenities ?? [],
    description: row.description ?? '',
    manager: row.manager ?? 'Equipo Kasia',
    responseTime: row.response_time ?? 'Responde en menos de 24 horas',
    managerPhone: row.manager_phone ?? '+34 600 000 000',
    managerEmail: row.manager_email ?? 'hola@kasia-valencia.com',
  };
}

export async function fetchRooms(): Promise<Room[]> {
  const supabase = createClient();
  if (!supabase) return mockRooms;

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return mockRooms;
  return data.map(mapSupabaseRow);
}

export async function fetchRoomById(id: string): Promise<Room | undefined> {
  const supabase = createClient();
  if (!supabase) return mockRooms.find((room) => room.id === id);

  const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
  if (error || !data) return mockRooms.find((room) => room.id === id);
  return mapSupabaseRow(data);
}
