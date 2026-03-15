import { Router } from 'express';
import { ConfigService } from '../services/ConfigService';
import { PlexService } from '../services/PlexService';
import { MaintainerrService } from '../services/MaintainerrService';
import { SchedulerService } from '../services/SchedulerService';
import { ProcessorService } from '../services/ProcessorService';
import { OverlayService } from '../services/OverlayService';
import { StateService } from '../services/StateService';
import { LogService } from '../services/LogService';
import { createConfigRoutes } from './config.routes';
import { createProcessorRoutes } from './processor.routes';
import { createCollectionRoutes } from './collections.routes';
import { createLogsRoutes } from './logs.routes';
import { createStateRoutes } from './state.routes';
import { createFontsRoutes } from './fonts.routes';
import { createPreviewRoutes } from './preview.routes';

export function createApiRouter(services: {
  config: ConfigService;
  plex: PlexService;
  maintainerr: MaintainerrService;
  scheduler: SchedulerService;
  processor: ProcessorService;
  overlay: OverlayService;
  state: StateService;
  log: LogService;
}): Router {
  const router = Router();

  router.use('/config', createConfigRoutes(services.config, services.plex, services.maintainerr, services.scheduler));
  router.use('/processor', createProcessorRoutes(services.processor));
  router.use('/collections', createCollectionRoutes(services.maintainerr, services.plex, services.overlay, services.config, services.state));
  router.use('/logs', createLogsRoutes(services.log));
  router.use('/state', createStateRoutes(services.state));
  router.use('/fonts', createFontsRoutes(services.config.get().fontsDir));
  router.use('/preview', createPreviewRoutes(services.plex, services.overlay, services.config));

  return router;
}
