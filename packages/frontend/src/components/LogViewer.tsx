import { useRef, useEffect, useState } from 'react';
import { useLogStream, LogEntry, LogLevel } from '../api/logs';

const levelColors: Record<LogLevel, string> = {
  INF: 'text-blue-400',
  WRN: 'text-yellow-400',
  ERR: 'text-red-400',
  DBG: 'text-gray-500',
  SUC: 'text-green-400',
};

const LEVELS: LogLevel[] = ['INF', 'WRN', 'ERR', 'DBG', 'SUC'];

interface Props {
  maxLines?: number;
  autoScroll?: boolean;
}

export default function LogViewer({ maxLines = 200, autoScroll = true }: Props) {
  const entries = useLogStream();
  const [filter, setFilter] = useState<Set<LogLevel>>(new Set(LEVELS));
  const bottomRef = useRef<HTMLDivElement>(null);

  const visible = entries.filter((e) => filter.has(e.level)).slice(-maxLines);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visible.length, autoScroll]);

  const toggleLevel = (level: LogLevel) => {
    setFilter((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-2 flex-wrap">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => toggleLevel(level)}
            className={`px-2 py-0.5 text-xs rounded font-mono border transition-opacity ${
              filter.has(level) ? 'opacity-100' : 'opacity-30'
            } ${levelColors[level]} border-current`}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-950 rounded border border-gray-800 p-3 font-mono text-xs space-y-0.5">
        {visible.length === 0 && (
          <span className="text-gray-600">No log entries.</span>
        )}
        {visible.map((entry: LogEntry) => (
          <div key={entry.id} className="flex gap-2 leading-relaxed">
            <span className="text-gray-600 shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span className={`shrink-0 w-8 font-bold ${levelColors[entry.level]}`}>
              {entry.level}
            </span>
            <span className="text-gray-300 break-all">{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
