import client from './client';

export interface ProcessorStatus {
  status: 'idle' | 'running' | 'error';
  lastRun: string | null;
  lastResult: {
    processed: number;
    reverted: number;
    skipped: number;
    errors: number;
  } | null;
}

export async function getProcessorStatus(): Promise<ProcessorStatus> {
  const { data } = await client.get<ProcessorStatus>('/processor/status');
  return data;
}

export async function startRun(): Promise<void> {
  await client.post('/processor/run');
}

export async function resetOverlays(): Promise<void> {
  await client.delete('/processor/reset');
}
