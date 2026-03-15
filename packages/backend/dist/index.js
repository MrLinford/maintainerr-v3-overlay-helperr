"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const http = __importStar(require("http"));
const server_1 = require("./server");
const ConfigService_1 = require("./services/ConfigService");
const StateService_1 = require("./services/StateService");
const LogService_1 = require("./services/LogService");
const MaintainerrService_1 = require("./services/MaintainerrService");
const PlexService_1 = require("./services/PlexService");
const OverlayService_1 = require("./services/OverlayService");
const ProcessorService_1 = require("./services/ProcessorService");
const SchedulerService_1 = require("./services/SchedulerService");
const DATA_DIR = process.env.DATA_DIR ?? './data';
const PORT = parseInt(process.env.PORT ?? '3000', 10);
// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });
// Bootstrap services
const log = new LogService_1.LogService();
const config = new ConfigService_1.ConfigService(DATA_DIR);
const state = new StateService_1.StateService(DATA_DIR);
const cfg = config.get();
const maintainerr = new MaintainerrService_1.MaintainerrService(cfg.maintainerr.url, log);
const plex = new PlexService_1.PlexService(cfg.plex.url, cfg.plex.token, log);
const overlay = new OverlayService_1.OverlayService(log);
const processor = new ProcessorService_1.ProcessorService(config, state, log, maintainerr, plex, overlay);
const scheduler = new SchedulerService_1.SchedulerService(processor, log);
// Start Express
const app = (0, server_1.createApp)({ config, plex, maintainerr, scheduler, processor, overlay, state, log });
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
function shutdown() {
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
//# sourceMappingURL=index.js.map