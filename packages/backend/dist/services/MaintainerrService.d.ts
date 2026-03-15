import { MaintainerrCollection } from '../types/maintainerr';
import { LogService } from './LogService';
export declare class MaintainerrService {
    private baseUrl;
    private log;
    private client;
    constructor(baseUrl: string, log: LogService);
    updateBaseUrl(url: string): void;
    testConnection(): Promise<boolean>;
    getCollections(): Promise<MaintainerrCollection[]>;
    getLibraryCollections(libraryId: string | number): Promise<{
        ratingKey: string;
        title: string;
    }[]>;
}
//# sourceMappingURL=MaintainerrService.d.ts.map