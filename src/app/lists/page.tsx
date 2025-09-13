import { fetchCurrentUserLikeIds, fetchLikedMembers } from '../actions/likeActions';
import ListsTab from './ListsTab';

export const dynamic = 'force-dynamic';

export default async function ListsPage({ searchParams }: { searchParams: { type: string } }) {
  const likeIds = await fetchCurrentUserLikeIds();
  const params = await searchParams;
  const members = await fetchLikedMembers(params.type);

  return (
    <div>
      <ListsTab members={members} likeIds={likeIds} />
    </div>
  );
}
