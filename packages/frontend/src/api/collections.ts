import client from './client';

export interface ItemState {
  processed: boolean;
  deleteDate: string | null;
  uploadedPosterId: string | null;
  daysLeftShown: number | null;
}

export interface CollectionItem {
  id: number;
  mediaServerId: string;
  addDate: string;
  overlayState: ItemState | null;
}

export interface Collection {
  id: number;
  title: string;
  deleteAfterDays: number | null;
  libraryId: string;
  manualCollection: boolean;
  manualCollectionName: string;
  media: CollectionItem[];
}

export async function getCollections(): Promise<Collection[]> {
  const { data } = await client.get<Collection[]>('/collections');
  return data;
}
