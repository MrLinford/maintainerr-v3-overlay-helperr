"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfigRoutes = createConfigRoutes;
const express_1 = require("express");
function createConfigRoutes(config, plex, maintainerr, scheduler) {
    const router = (0, express_1.Router)();
    router.get('/', (_req, res) => {
        res.json(config.get());
    });
    router.put('/', (req, res) => {
        try {
            const updated = config.update(req.body);
            // Sync services with new connection settings
            const cfg = config.get();
            plex.updateConnection(cfg.plex.url, cfg.plex.token);
            maintainerr.updateBaseUrl(cfg.maintainerr.url);
            // Reschedule if cron changed
            if (req.body?.scheduler?.cronSchedule) {
                scheduler.reschedule(cfg.scheduler.cronSchedule);
            }
            res.json(updated);
        }
        catch (err) {
            res.status(400).json({ error: String(err) });
        }
    });
    router.post('/test-plex', async (_req, res) => {
        const cfg = config.get();
        plex.updateConnection(cfg.plex.url, cfg.plex.token);
        const ok = await plex.testConnection();
        res.json({ success: ok });
    });
    router.post('/test-maintainerr', async (_req, res) => {
        const cfg = config.get();
        maintainerr.updateBaseUrl(cfg.maintainerr.url);
        const ok = await maintainerr.testConnection();
        res.json({ success: ok });
    });
    return router;
}
//# sourceMappingURL=config.routes.js.map