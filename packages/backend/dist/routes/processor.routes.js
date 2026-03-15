"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProcessorRoutes = createProcessorRoutes;
const express_1 = require("express");
function createProcessorRoutes(processor) {
    const router = (0, express_1.Router)();
    router.get('/status', (_req, res) => {
        res.json({
            status: processor.status,
            lastRun: processor.lastRun?.toISOString() ?? null,
            lastResult: processor.lastResult,
        });
    });
    router.post('/run', async (_req, res) => {
        if (processor.status === 'running') {
            res.status(409).json({ error: 'Processor is already running.' });
            return;
        }
        // Fire and forget; client can poll /status or watch SSE logs
        processor.run().catch(() => { });
        res.json({ message: 'Run started.' });
    });
    router.delete('/reset', async (_req, res) => {
        if (processor.status === 'running') {
            res.status(409).json({ error: 'Cannot reset while processor is running.' });
            return;
        }
        await processor.resetAllOverlays();
        res.json({ message: 'All overlays reset.' });
    });
    return router;
}
//# sourceMappingURL=processor.routes.js.map