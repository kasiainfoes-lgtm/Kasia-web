import Catalog from '@/components/Catalog';
import { fetchRooms } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import { getOwnApplicationAnswers } from '@/lib/applications.server';
import { roomAcceptsProfile } from '@/lib/rooms';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const { applicationId } = await requireApprovedAccess('/rooms');

  const [rooms, ownAnswers] = await Promise.all([
    fetchRooms(),
    applicationId ? getOwnApplicationAnswers(applicationId) : Promise.resolve(null),
  ]);

  const visibleRooms = ownAnswers
    ? rooms.filter((room) => roomAcceptsProfile(room, ownAnswers))
    : rooms;

  return <Catalog rooms={visibleRooms} />;
}
