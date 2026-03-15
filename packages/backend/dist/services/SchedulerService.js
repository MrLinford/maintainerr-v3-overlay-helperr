"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
class SchedulerService {
    processor;
    log;
    task = null;
    currentSchedule = '';
    constructor(processor, log) {
        this.processor = processor;
        this.log = log;
    }
    start(schedule) {
        this.stop();
        if (!schedule || !node_cron_1.default.validate(schedule)) {
            this.log.warn(`Invalid cron schedule "${schedule}", scheduler not started.`);
            return;
        }
        this.currentSchedule = schedule;
        this.task = node_cron_1.default.schedule(schedule, async () => {
            this.log.info(`Scheduled run triggered (${schedule})`);
            await this.processor.run();
        });
        this.log.info(`Scheduler started with cron: ${schedule}`);
    }
    stop() {
        if (this.task) {
            this.task.stop();
            this.task = null;
            this.log.info('Scheduler stopped.');
        }
    }
    reschedule(schedule) {
        this.start(schedule);
    }
    getSchedule() {
        return this.currentSchedule;
    }
    isRunning() {
        return this.task !== null;
    }
}
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=SchedulerService.js.map