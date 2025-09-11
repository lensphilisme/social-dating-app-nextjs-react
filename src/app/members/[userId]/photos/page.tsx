import { getMemberPhotosByUserId } from '@/app/actions/memberActions';
import MemberPhotos from '@/components/MemberPhotos';
import { CardBody, CardHeader, Divider } from '@nextui-org/react';

export default async function PhotosPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const photos = await getMemberPhotosByUserId(userId);
  return (
    <>
      <CardHeader className='text-2xl font-semibold text-secondary'>Photos</CardHeader>
      <Divider />
      <CardBody>
        <MemberPhotos photos={photos} />
      </CardBody>
    </>
  );
}
