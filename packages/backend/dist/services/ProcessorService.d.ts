import { ConfigService } from './ConfigService';
import { StateService } from './StateService';
import { LogService } from './LogService';
import { MaintainerrService } from './MaintainerrService';
import { PlexService } from './PlexService';
import { OverlayService } from './OverlayService';
export type ProcessorStatus = 'idle' | 'running' | 'error';
export interface ProcessorRunResult {
    processed: number;
    reverted: number;
    skipped: number;
    errors: number;
}
export declare class ProcessorService {
    private config;
    private state;
    private log;
    private maintainerr;
    private plex;
    private overlay;
    status: ProcessorStatus;
    lastRun: Date | null;
    lastResult: ProcessorRunResult | null;
    constructor(config: ConfigService, state: StateService, log: LogService, maintainerr: MaintainerrService, plex: PlexService, overlay: OverlayService);
    private getDeleteDate;
    private getDaysLeft;
    private ordinalSuffix;
    private formatDateLabel;
    private convertDateFormat;
    private getOriginalPosterPath;
    private saveOriginalPoster;
    private loadOriginalPoster;
    private deleteOriginalPoster;
    private revertItem;
    private applyOverlay;
    private reorderCollection;
    private janitorCleanup;
    resetAllOverlays(): Promise<void>;
    run(): Promise<ProcessorRunResult>;
    private resolveCollectionOrder;
}
//# sourceMappingURL=ProcessorService.d.ts.map