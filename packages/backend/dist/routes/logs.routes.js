"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogsRoutes = createLogsRoutes;
const express_1 = require("express");
function createLogsRoutes(logService) {
    const router = (0, express_1.Router)();
    // Server-Sent Events stream for real-time logs
    router.get('/stream', (req, res) => {
        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        });
        res.flushHeaders();
        const send = (entry) => {
            res.write(`data: ${JSON.stringify(entry)}\n\n`);
        };
        logService.on('log', send);
        req.on('close', () => {
            logService.off('log', send);
        });
    });
    // Historical log entries
    router.get('/history', (req, res) => {
        const limit = parseInt(String(req.query.limit ?? '200'), 10);
        res.json(logService.history(limit));
    });
    return router;
}
//# sourceMappingURL=logs.routes.js.map