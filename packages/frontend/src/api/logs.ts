import client from './client';
import { useEffect, useRef, useState } from 'react';

export type LogLevel = 'INF' | 'WRN' | 'ERR' | 'DBG' | 'SUC';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export async function getLogHistory(limit = 200): Promise<LogEntry[]> {
  const { data } = await client.get<LogEntry[]>(`/logs/history?limit=${limit}`);
  return data;
}

export function useLogStream() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Load history first
    getLogHistory(200).then((history) => setEntries(history)).catch(() => {});

    const es = new EventSource('/api/logs/stream');
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const entry: LogEntry = JSON.parse(event.data);
        setEntries((prev) => [...prev.slice(-999), entry]);
      } catch {
        /* ignore parse errors */
      }
    };

    return () => {
      es.close();
    };
  }, []);

  return entries;
}
