import client from './client';

export interface PreviewItem {
  plexId: string;
  title: string;
}

export async function getRandomPreviewItem(): Promise<PreviewItem> {
  const { data } = await client.get<PreviewItem>('/preview/item');
  return data;
}
