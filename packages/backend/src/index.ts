import * as fs from 'fs';
import * as http from 'http';
import { createApp } from './server';
import { ConfigService } from './services/ConfigService';
import { StateService } from './services/StateService';
import { LogService } from './services/LogService';
import { MaintainerrService } from './services/MaintainerrService';
import { PlexService } from './services/PlexService';
import { OverlayService } from './services/OverlayService';
import { ProcessorService } from './services/ProcessorService';
import { SchedulerService } from './services/SchedulerService';

const DATA_DIR = process.env.DATA_DIR ?? './data';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });

// Bootstrap services
const log         = new LogService();
const config      = new ConfigService(DATA_DIR);
const state       = new StateService(DATA_DIR);
const cfg         = config.get();

const maintainerr = new MaintainerrService(cfg.maintainerr.url, log);
const plex        = new PlexService(cfg.plex.url, cfg.plex.token, log);
const overlay     = new OverlayService(log);
const processor   = new ProcessorService(config, state, log, maintainerr, plex, overlay);
const scheduler   = new SchedulerService(processor, log);

// Start Express
const app    = createApp({ config, plex, maintainerr, scheduler, processor, overlay, state, log });
const server = http.createServer(app);

server.listen(PORT, () => {
  log.success(`Maintainerr Overlay Helper listening on port ${PORT}`);
  log.info(`Data directory: ${DATA_DIR}`);
  log.info(`Fonts directory: ${cfg.fontsDir}`);

  // Start scheduler
  if (cfg.scheduler.cronSchedule) {
    scheduler.start(cfg.scheduler.cronSchedule);
  }

  // Run on start if configured
  if (cfg.scheduler.runOnStart) {
    log.info('RUN_ON_CREATION is enabled — starting initial run…');
    processor.run().catch((err) => log.error(`Initial run failed: ${err}`));
  }
});

// Graceful shutdown
function shutdown(): void {
  log.info('Shutting down…');
  scheduler.stop();
  server.close(() => {
    log.info('Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
