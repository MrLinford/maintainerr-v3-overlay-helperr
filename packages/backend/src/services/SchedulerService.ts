import cron from 'node-cron';
import { ProcessorService } from './ProcessorService';
import { LogService } from './LogService';

export class SchedulerService {
  private task: cron.ScheduledTask | null = null;
  private currentSchedule: string = '';

  constructor(
    private processor: ProcessorService,
    private log: LogService,
  ) {}

  start(schedule: string): void {
    this.stop();

    if (!schedule || !cron.validate(schedule)) {
      this.log.warn(`Invalid cron schedule "${schedule}", scheduler not started.`);
      return;
    }

    this.currentSchedule = schedule;
    this.task = cron.schedule(schedule, async () => {
      this.log.info(`Scheduled run triggered (${schedule})`);
      await this.processor.run();
    });

    this.log.info(`Scheduler started with cron: ${schedule}`);
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.log.info('Scheduler stopped.');
    }
  }

  reschedule(schedule: string): void {
    this.start(schedule);
  }

  getSchedule(): string {
    return this.currentSchedule;
  }

  isRunning(): boolean {
    return this.task !== null;
  }
}
