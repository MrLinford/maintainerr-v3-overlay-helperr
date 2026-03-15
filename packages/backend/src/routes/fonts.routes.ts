import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

export function createFontsRoutes(fontsDir: string): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    try {
      if (!fs.existsSync(fontsDir)) {
        res.json([]);
        return;
      }
      const files = fs.readdirSync(fontsDir).filter((f) =>
        ['.ttf', '.otf', '.woff', '.woff2'].includes(path.extname(f).toLowerCase()),
      );
      res.json(files.map((f) => ({ name: f, path: path.join(fontsDir, f) })));
    } catch {
      res.json([]);
    }
  });

  return router;
}
