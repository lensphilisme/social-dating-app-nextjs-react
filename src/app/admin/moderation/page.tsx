import { getModerationQueue } from '@/app/actions/adminSystemActions';
import { getUnapprovedPhotos } from '@/app/actions/adminActions';
import AdvancedModeration from '@/components/admin/AdvancedModeration';

export const dynamic = 'force-dynamic';

export default async function ModerationPage() {
  const [moderationQueue, unapprovedPhotos] = await Promise.all([
    getModerationQueue('PENDING', undefined, 1, 50),
    getUnapprovedPhotos()
  ]);

  return (
    <AdvancedModeration 
      moderationQueue={moderationQueue}
      unapprovedPhotos={unapprovedPhotos}
    />
  );
}
