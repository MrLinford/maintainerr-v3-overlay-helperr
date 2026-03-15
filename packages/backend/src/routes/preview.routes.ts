import { Router, Request, Response } from 'express';
import { addDays } from 'date-fns';
import { format as dateFnsFormat } from 'date-fns';
import { PlexService } from '../services/PlexService';
import { OverlayService } from '../services/OverlayService';
import { ConfigService } from '../services/ConfigService';
import { OverlayRenderOptions } from '../types/overlay';

export function createPreviewRoutes(
  plex: PlexService,
  overlay: OverlayService,
  config: ConfigService,
): Router {
  const router = Router();

  // GET /api/preview/item
  // Returns { plexId, title } for a random item from the Plex library.
  router.get('/item', async (_req: Request, res: Response) => {
    const cfg = config.get();
    if (!cfg.plex.url || !cfg.plex.token) {
      res.status(400).json({ error: 'Plex is not configured.' });
      return;
    }
    plex.updateConnection(cfg.plex.url, cfg.plex.token);

    const item = await plex.getRandomLibraryItem();
    if (!item) {
      res.status(404).json({ error: 'Could not find any poster items in the Plex library.' });
      return;
    }
    res.json(item);
  });

  // GET /api/preview?plexId=<id>
  // Renders the overlay (using the currently saved config) onto the poster for
  // the given Plex item and streams back the resulting JPEG.
  router.get('/', async (req: Request, res: Response) => {
    const plexId = String(req.query.plexId ?? '').trim();
    if (!plexId) {
      res.status(400).json({ error: 'plexId query parameter is required.' });
      return;
    }

    const cfg = config.get();
    if (!cfg.plex.url || !cfg.plex.token) {
      res.status(400).json({ error: 'Plex is not configured.' });
      return;
    }
    plex.updateConnection(cfg.plex.url, cfg.plex.token);

    try {
      const thumbPath = await plex.getBestPosterUrl(plexId);
      if (!thumbPath) {
        res.status(404).json({ error: 'Could not find poster for the given plexId.' });
        return;
      }

      const posterBuf = await plex.downloadPoster(thumbPath);

      // Build a realistic sample label 2 weeks from now using the saved text config.
      const sampleDate = addDays(new Date(), 14);
      let sampleLabel: string;
      if (cfg.overlayText.useDays) {
        sampleLabel = cfg.overlayText.textDays.replace('{0}', '14');
      } else {
        const fmt = convertDateFormat(cfg.overlayText.dateFormat);
        sampleLabel = `${cfg.overlayText.overlayText} ${dateFnsFormat(sampleDate, fmt)}`;
        if (cfg.overlayText.enableDaySuffix && cfg.overlayText.language.startsWith('en')) {
          const day = sampleDate.getDate();
          const lastTwo = Math.abs(day) % 100;
          let ordinal = `${day}th`;
          if (lastTwo < 11 || lastTwo > 13) {
            switch (Math.abs(day) % 10) {
              case 1: ordinal = `${day}st`; break;
              case 2: ordinal = `${day}nd`; break;
              case 3: ordinal = `${day}rd`; break;
            }
          }
          sampleLabel = sampleLabel.replace(new RegExp(`\\b${day}\\b`), ordinal);
        }
      }
      if (cfg.overlayText.enableUppercase) sampleLabel = sampleLabel.toUpperCase();

      const overlayOpts: OverlayRenderOptions = {
        text: sampleLabel,
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
      res.set('Cache-Control', 'no-store');
      res.send(result.buffer);
    } catch (err) {
      res.status(500).json({ error: `Preview rendering failed: ${err}` });
    }
  });

  return router;
}

// Converts day/weekday tokens that differ between common formats and date-fns.
function convertDateFormat(fmt: string): string {
  return fmt
    .replace(/dddd/g, 'EEEE')   // full weekday name
    .replace(/ddd/g, 'EEE');    // abbreviated weekday name
}
