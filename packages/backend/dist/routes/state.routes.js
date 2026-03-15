"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStateRoutes = createStateRoutes;
const express_1 = require("express");
function createStateRoutes(state) {
    const router = (0, express_1.Router)();
    router.get('/', (_req, res) => {
        res.json(state.getAll());
    });
    router.delete('/:plexId', (req, res) => {
        state.removeItem(req.params.plexId);
        res.json({ message: `State entry for ${req.params.plexId} removed.` });
    });
    router.delete('/', (_req, res) => {
        state.clear();
        res.json({ message: 'State cleared.' });
    });
    return router;
}
//# sourceMappingURL=state.routes.js.map