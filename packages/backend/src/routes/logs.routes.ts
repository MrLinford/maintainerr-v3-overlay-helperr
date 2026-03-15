import { Router, Request, Response } from 'express';
import { LogService, LogLevel } from '../services/LogService';

export function createLogsRoutes(logService: LogService): Router {
  const router = Router();

  // Server-Sent Events stream for real-time logs
  router.get('/stream', (req: Request, res: Response) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    const send = (entry: { id: number; timestamp: string; level: LogLevel; message: string }) => {
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    };

    logService.on('log', send);

    req.on('close', () => {
      logService.off('log', send);
    });
  });

  // Historical log entries
  router.get('/history', (req: Request, res: Response) => {
    const limit = parseInt(String(req.query.limit ?? '200'), 10);
    res.json(logService.history(limit));
  });

  return router;
}
