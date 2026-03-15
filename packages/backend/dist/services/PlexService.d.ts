import { PlexPhoto } from '../types/plex';
import { LogService } from './LogService';
export declare class PlexService {
    private baseUrl;
    private token;
    private log;
    private client;
    constructor(baseUrl: string, token: string, log: LogService);
    private buildClient;
    updateConnection(url: string, token: string): void;
    testConnection(): Promise<boolean>;
    getBestPosterUrl(plexId: string): Promise<string | null>;
    downloadPoster(thumbPath: string): Promise<Buffer>;
    getPosters(plexId: string): Promise<PlexPhoto[]>;
    getUploadPosterIds(photos: PlexPhoto[]): string[];
    uploadPoster(plexId: string, buffer: Buffer, contentType: string): Promise<void>;
    selectPoster(plexId: string, uploadId: string): Promise<boolean>;
    deleteUploadedPoster(plexId: string, uploadId: string): Promise<boolean>;
    itemExists(plexId: string): Promise<boolean>;
    setCollectionCustomSort(collectionId: string): Promise<void>;
    moveCollectionItem(collectionId: string, itemId: string, afterId: string): Promise<void>;
}
//# sourceMappingURL=PlexService.d.ts.map