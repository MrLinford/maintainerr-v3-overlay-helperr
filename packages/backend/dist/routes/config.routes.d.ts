import { Router } from 'express';
import { ConfigService } from '../services/ConfigService';
import { PlexService } from '../services/PlexService';
import { MaintainerrService } from '../services/MaintainerrService';
import { SchedulerService } from '../services/SchedulerService';
export declare function createConfigRoutes(config: ConfigService, plex: PlexService, maintainerr: MaintainerrService, scheduler: SchedulerService): Router;
//# sourceMappingURL=config.routes.d.ts.map