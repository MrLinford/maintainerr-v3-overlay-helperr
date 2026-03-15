import { Router, Request, Response } from 'express';
import { ConfigService } from '../services/ConfigService';
import { PlexService } from '../services/PlexService';
import { MaintainerrService } from '../services/MaintainerrService';
import { SchedulerService } from '../services/SchedulerService';
import { DeepPartial } from '../types/config';

export function createConfigRoutes(
  config: ConfigService,
  plex: PlexService,
  maintainerr: MaintainerrService,
  scheduler: SchedulerService,
): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(config.get());
  });

  router.put('/', (req: Request, res: Response) => {
    try {
      const updated = config.update(req.body as DeepPartial<ReturnType<typeof config.get>>);

      // Sync services with new connection settings
      const cfg = config.get();
      plex.updateConnection(cfg.plex.url, cfg.plex.token);
      maintainerr.updateBaseUrl(cfg.maintainerr.url);

      // Reschedule if cron changed
      if (req.body?.scheduler?.cronSchedule) {
        scheduler.reschedule(cfg.scheduler.cronSchedule);
      }

      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  router.post('/test-plex', async (_req: Request, res: Response) => {
    const cfg = config.get();
    plex.updateConnection(cfg.plex.url, cfg.plex.token);
    const ok = await plex.testConnection();
    res.json({ success: ok });
  });

  router.post('/test-maintainerr', async (_req: Request, res: Response) => {
    const cfg = config.get();
    maintainerr.updateBaseUrl(cfg.maintainerr.url);
    const ok = await maintainerr.testConnection();
    res.json({ success: ok });
  });

  return router;
}
