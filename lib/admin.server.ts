import { createAdminClient } from '@/lib/supabase/admin';

export type BookingRow = {
  id: string;
  roomId: string;
  roomTitle: string;
  roomZone: string;
  manager: string;
  userEmail: string | null;
  status: 'nuevo' | 'verificado' | 'revision' | 'pagado';
  amount: number | null;
  visitStatus: 'pendiente' | 'agendada' | 'hecha';
  visitAt: string | null;
  finalChoiceRoomId: string | null;
  transferProofSubmittedAt: string | null;
  createdAt: string;
};

export async function fetchAllBookings(): Promise<BookingRow[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from('bookings')
    .select('*, properties!bookings_room_id_fkey(title, zone, manager)')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    roomId: row.room_id,
    roomTitle: row.properties?.title ?? row.room_id,
    roomZone: row.properties?.zone ?? '—',
    manager: row.properties?.manager ?? '—',
    userEmail: row.user_email,
    status: row.status,
    amount: row.amount ? Number(row.amount) : null,
    visitStatus: row.visit_status,
    visitAt: row.visit_at,
    finalChoiceRoomId: row.final_choice_room_id,
    transferProofSubmittedAt: row.transfer_proof_submitted_at,
    createdAt: row.created_at,
  }));
}
