import { EventEmitter } from 'events';

export type LogLevel = 'INF' | 'WRN' | 'ERR' | 'DBG' | 'SUC';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  INF: '\x1b[36m',
  WRN: '\x1b[33m',
  ERR: '\x1b[31m',
  DBG: '\x1b[90m',
  SUC: '\x1b[32m',
};
const RESET = '\x1b[0m';

export class LogService extends EventEmitter {
  private static readonly RING_SIZE = 2000;
  private ring: LogEntry[] = [];
  private counter = 0;

  private write(level: LogLevel, message: string): void {
    const entry: LogEntry = {
      id: ++this.counter,
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    this.ring.push(entry);
    if (this.ring.length > LogService.RING_SIZE) this.ring.shift();

    const color = LEVEL_COLORS[level] ?? '';
    process.stdout.write(
      `${color}[${entry.level}]${RESET} ${entry.timestamp} ${message}\n`,
    );

    this.emit('log', entry);
  }

  info(msg: string): void    { this.write('INF', msg); }
  warn(msg: string): void    { this.write('WRN', msg); }
  error(msg: string): void   { this.write('ERR', msg); }
  debug(msg: string): void   { this.write('DBG', msg); }
  success(msg: string): void { this.write('SUC', msg); }

  history(limit = 500): LogEntry[] {
    return this.ring.slice(-limit);
  }
}
