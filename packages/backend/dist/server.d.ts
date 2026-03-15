import { Application } from 'express';
import { ConfigService } from './services/ConfigService';
import { PlexService } from './services/PlexService';
import { MaintainerrService } from './services/MaintainerrService';
import { SchedulerService } from './services/SchedulerService';
import { ProcessorService } from './services/ProcessorService';
import { OverlayService } from './services/OverlayService';
import { StateService } from './services/StateService';
import { LogService } from './services/LogService';
export interface AppServices {
    config: ConfigService;
    plex: PlexService;
    maintainerr: MaintainerrService;
    scheduler: SchedulerService;
    processor: ProcessorService;
    overlay: OverlayService;
    state: StateService;
    log: LogService;
}
export declare function createApp(services: AppServices): Application;
//# sourceMappingURL=server.d.ts.map