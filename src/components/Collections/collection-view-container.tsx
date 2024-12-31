import axios from 'axios';
import { CollectionViewPage } from '@/components/Collections/CollectionViewPage';

type Props = {
  collectionId: string;
};

export default async function CollectionViewContainer({ collectionId }: Props) {
  try {
    const { data } = await axios.get(
      `http://localhost:8000/collections/${collectionId}`
    );
    return (
      <CollectionViewPage
        collectionId={collectionId}
        collectionName={data.name}
      />
    );
  } catch (error) {
  }
}
