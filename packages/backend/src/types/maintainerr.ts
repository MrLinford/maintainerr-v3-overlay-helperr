export interface MaintainerrMediaItem {
  id: number;
  mediaServerId: string;
  tmdbId?: number;
  addDate: string;
  image_path?: string;
  isManual?: boolean;
}

export interface MaintainerrCollection {
  id: number;
  title: string;
  deleteAfterDays: number | null;
  libraryId: string;
  manualCollection: boolean;
  manualCollectionName: string;
  media: MaintainerrMediaItem[];
}
