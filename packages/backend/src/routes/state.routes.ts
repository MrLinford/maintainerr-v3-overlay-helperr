import { Router, Request, Response } from 'express';
import { StateService } from '../services/StateService';

export function createStateRoutes(state: StateService): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(state.getAll());
  });

  router.delete('/:plexId', (req: Request, res: Response) => {
    state.removeItem(req.params.plexId);
    res.json({ message: `State entry for ${req.params.plexId} removed.` });
  });

  router.delete('/', (_req: Request, res: Response) => {
    state.clear();
    res.json({ message: 'State cleared.' });
  });

  return router;
}
