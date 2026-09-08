import Catalog from '@/components/Catalog';
import { fetchRooms } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  await requireApprovedAccess('/rooms');
  const rooms = await fetchRooms();

  return <Catalog rooms={rooms} />;
}
