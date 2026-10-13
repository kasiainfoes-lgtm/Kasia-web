import Catalog from '@/components/Catalog';
import { fetchPublishedRooms } from '@/lib/properties.server';
import { requireApprovedAccess } from '@/lib/require-approved.server';
import { getOwnApplicationAnswers } from '@/lib/applications.server';
import { roomAcceptsProfile, calculateMatchPercent } from '@/lib/rooms';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const { applicationId } = await requireApprovedAccess('/rooms');

  const [rooms, ownAnswers] = await Promise.all([
    fetchPublishedRooms(),
    applicationId ? getOwnApplicationAnswers(applicationId) : Promise.resolve(null),
  ]);

  const visibleRooms = (ownAnswers ? rooms.filter((room) => roomAcceptsProfile(room, ownAnswers)) : rooms).map(
    (room) => (ownAnswers ? { ...room, match: calculateMatchPercent(room, ownAnswers) } : room)
  );

  return <Catalog rooms={visibleRooms} />;
}
