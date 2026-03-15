export interface ItemState {
  processed: boolean;
  deleteDate: string | null;
  uploadedPosterId: string | null;
  daysLeftShown: number | null;
}

export type CollectionState = Record<string, ItemState>;
