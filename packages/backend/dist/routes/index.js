"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = createApiRouter;
const express_1 = require("express");
const config_routes_1 = require("./config.routes");
const processor_routes_1 = require("./processor.routes");
const collections_routes_1 = require("./collections.routes");
const logs_routes_1 = require("./logs.routes");
const state_routes_1 = require("./state.routes");
const fonts_routes_1 = require("./fonts.routes");
function createApiRouter(services) {
    const router = (0, express_1.Router)();
    router.use('/config', (0, config_routes_1.createConfigRoutes)(services.config, services.plex, services.maintainerr, services.scheduler));
    router.use('/processor', (0, processor_routes_1.createProcessorRoutes)(services.processor));
    router.use('/collections', (0, collections_routes_1.createCollectionRoutes)(services.maintainerr, services.plex, services.overlay, services.config, services.state));
    router.use('/logs', (0, logs_routes_1.createLogsRoutes)(services.log));
    router.use('/state', (0, state_routes_1.createStateRoutes)(services.state));
    router.use('/fonts', (0, fonts_routes_1.createFontsRoutes)(services.config.get().fontsDir));
    return router;
}
//# sourceMappingURL=index.js.map