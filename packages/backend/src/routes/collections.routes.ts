import { Router, Request, Response } from 'express';
import { MaintainerrService } from '../services/MaintainerrService';
import { PlexService } from '../services/PlexService';
import { OverlayService } from '../services/OverlayService';
import { ConfigService } from '../services/ConfigService';
import { StateService } from '../services/StateService';
import { OverlayRenderOptions } from '../types/overlay';

export function createCollectionRoutes(
  maintainerr: MaintainerrService,
  plex: PlexService,
  overlay: OverlayService,
  config: ConfigService,
  state: StateService,
): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const collections = await maintainerr.getCollections();
      const currentState = state.getAll();

      const enriched = collections.map((coll) => ({
        ...coll,
        media: coll.media.map((item) => ({
          ...item,
          overlayState: currentState[item.mediaServerId] ?? null,
        })),
      }));

      res.json(enriched);
    } catch (err) {
      res.status(502).json({ error: `Failed to fetch collections: ${err}` });
    }
  });

  // Generate a preview overlay for a specific collection item
  router.get('/:collectionId/preview', async (req: Request, res: Response) => {
    try {
      const cfg = config.get();
      const collections = await maintainerr.getCollections();
      const coll = collections.find((c) => String(c.id) === req.params.collectionId);

      if (!coll || coll.media.length === 0) {
        res.status(404).json({ error: 'Collection or media not found.' });
        return;
      }

      const firstItem = coll.media[0];
      const plexId = firstItem.mediaServerId;

      plex.updateConnection(cfg.plex.url, cfg.plex.token);
      const thumbPath = await plex.getBestPosterUrl(plexId);

      if (!thumbPath) {
        res.status(404).json({ error: 'Could not find poster for preview.' });
        return;
      }

      const posterBuf = await plex.downloadPoster(thumbPath);

      const overlayOpts: OverlayRenderOptions = {
        text: `${cfg.overlayText.overlayText} Oct 15`,
        fontPath: cfg.overlayStyle.fontPath,
        fontColor: cfg.overlayStyle.fontColor,
        backColor: cfg.overlayStyle.backColor,
        fontSize: cfg.overlayStyle.fontSize,
        padding: cfg.overlayStyle.padding,
        backRadius: cfg.overlayStyle.backRadius,
        horizontalOffset: cfg.overlayStyle.horizontalOffset,
        horizontalAlign: cfg.overlayStyle.horizontalAlign,
        verticalOffset: cfg.overlayStyle.verticalOffset,
        verticalAlign: cfg.overlayStyle.verticalAlign,
        overlayBottomCenter: cfg.overlayStyle.overlayBottomCenter,
        useFrame: cfg.frame.useFrame,
        frameColor: cfg.frame.frameColor,
        frameWidth: cfg.frame.frameWidth,
        frameRadius: cfg.frame.frameRadius,
        frameInnerRadius: cfg.frame.frameInnerRadius,
        frameInnerRadiusMode: cfg.frame.frameInnerRadiusMode,
        frameInset: cfg.frame.frameInset,
        dockStyle: cfg.frame.dockStyle,
        dockPosition: cfg.frame.dockPosition,
      };

      const result = await overlay.renderOverlay(posterBuf, overlayOpts);
      res.set('Content-Type', result.contentType);
      res.send(result.buffer);
    } catch (err) {
      res.status(500).json({ error: `Preview generation failed: ${err}` });
    }
  });

  return router;
}
