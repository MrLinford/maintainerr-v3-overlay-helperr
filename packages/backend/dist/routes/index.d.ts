import { Router } from 'express';
import { ConfigService } from '../services/ConfigService';
import { PlexService } from '../services/PlexService';
import { MaintainerrService } from '../services/MaintainerrService';
import { SchedulerService } from '../services/SchedulerService';
import { ProcessorService } from '../services/ProcessorService';
import { OverlayService } from '../services/OverlayService';
import { StateService } from '../services/StateService';
import { LogService } from '../services/LogService';
export declare function createApiRouter(services: {
    config: ConfigService;
    plex: PlexService;
    maintainerr: MaintainerrService;
    scheduler: SchedulerService;
    processor: ProcessorService;
    overlay: OverlayService;
    state: StateService;
    log: LogService;
}): Router;
//# sourceMappingURL=index.d.ts.map