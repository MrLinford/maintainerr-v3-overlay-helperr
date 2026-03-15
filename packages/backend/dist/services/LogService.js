"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const events_1 = require("events");
const LEVEL_COLORS = {
    INF: '\x1b[36m',
    WRN: '\x1b[33m',
    ERR: '\x1b[31m',
    DBG: '\x1b[90m',
    SUC: '\x1b[32m',
};
const RESET = '\x1b[0m';
class LogService extends events_1.EventEmitter {
    static RING_SIZE = 2000;
    ring = [];
    counter = 0;
    write(level, message) {
        const entry = {
            id: ++this.counter,
            timestamp: new Date().toISOString(),
            level,
            message,
        };
        this.ring.push(entry);
        if (this.ring.length > LogService.RING_SIZE)
            this.ring.shift();
        const color = LEVEL_COLORS[level] ?? '';
        process.stdout.write(`${color}[${entry.level}]${RESET} ${entry.timestamp} ${message}\n`);
        this.emit('log', entry);
    }
    info(msg) { this.write('INF', msg); }
    warn(msg) { this.write('WRN', msg); }
    error(msg) { this.write('ERR', msg); }
    debug(msg) { this.write('DBG', msg); }
    success(msg) { this.write('SUC', msg); }
    history(limit = 500) {
        return this.ring.slice(-limit);
    }
}
exports.LogService = LogService;
//# sourceMappingURL=LogService.js.map