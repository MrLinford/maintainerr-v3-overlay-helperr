import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as path from 'path';
import * as fs from 'fs';
import { createApiRouter } from './routes';
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

export function createApp(services: AppServices): Application {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(morgan('dev'));

  // API routes
  app.use('/api', createApiRouter(services));

  // Serve React frontend static files
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    // SPA fallback
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  } else {
    app.get('/', (_req: Request, res: Response) => {
      res.json({ message: 'Maintainerr Overlay Helper API running. Frontend not built.' });
    });
  }

  return app;
}
