import { CollectionState } from '../types/state';
export declare class StateService {
    private statePath;
    constructor(dataDir: string);
    load(): CollectionState;
    save(state: CollectionState): void;
    clear(): void;
    getAll(): CollectionState;
    removeItem(plexId: string): void;
}
//# sourceMappingURL=StateService.d.ts.map