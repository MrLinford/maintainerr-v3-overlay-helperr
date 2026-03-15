import { ProcessorService } from './ProcessorService';
import { LogService } from './LogService';
export declare class SchedulerService {
    private processor;
    private log;
    private task;
    private currentSchedule;
    constructor(processor: ProcessorService, log: LogService);
    start(schedule: string): void;
    stop(): void;
    reschedule(schedule: string): void;
    getSchedule(): string;
    isRunning(): boolean;
}
//# sourceMappingURL=SchedulerService.d.ts.map