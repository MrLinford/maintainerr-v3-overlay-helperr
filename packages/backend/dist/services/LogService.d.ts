import { EventEmitter } from 'events';
export type LogLevel = 'INF' | 'WRN' | 'ERR' | 'DBG' | 'SUC';
export interface LogEntry {
    id: number;
    timestamp: string;
    level: LogLevel;
    message: string;
}
export declare class LogService extends EventEmitter {
    private static readonly RING_SIZE;
    private ring;
    private counter;
    private write;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
    debug(msg: string): void;
    success(msg: string): void;
    history(limit?: number): LogEntry[];
}
//# sourceMappingURL=LogService.d.ts.map