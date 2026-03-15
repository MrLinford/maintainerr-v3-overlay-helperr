import { Router, Request, Response } from 'express';
import { ProcessorService } from '../services/ProcessorService';

export function createProcessorRoutes(processor: ProcessorService): Router {
  const router = Router();

  router.get('/status', (_req: Request, res: Response) => {
    res.json({
      status: processor.status,
      lastRun: processor.lastRun?.toISOString() ?? null,
      lastResult: processor.lastResult,
    });
  });

  router.post('/run', async (_req: Request, res: Response) => {
    if (processor.status === 'running') {
      res.status(409).json({ error: 'Processor is already running.' });
      return;
    }
    // Fire and forget; client can poll /status or watch SSE logs
    processor.run().catch(() => {});
    res.json({ message: 'Run started.' });
  });

  router.delete('/reset', async (_req: Request, res: Response) => {
    if (processor.status === 'running') {
      res.status(409).json({ error: 'Cannot reset while processor is running.' });
      return;
    }
    await processor.resetAllOverlays();
    res.json({ message: 'All overlays reset.' });
  });

  return router;
}
