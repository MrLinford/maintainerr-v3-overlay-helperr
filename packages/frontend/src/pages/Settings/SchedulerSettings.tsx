import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfig, updateConfig, AppConfig } from '../../api/config';

export default function SchedulerSettings() {
  const qc = useQueryClient();
  const { data: cfg, isLoading } = useQuery({ queryKey: ['config'], queryFn: getConfig });

  const [cronSchedule, setCronSchedule] = useState('');
  const [runOnStart, setRunOnStart] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (values: AppConfig['scheduler']) =>
      updateConfig({ scheduler: values } as Partial<AppConfig>),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ['config'] });
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading || !cfg) return <p className="text-gray-400">Loading…</p>;

  const currentSchedule = cronSchedule || cfg.scheduler.cronSchedule;
  const currentRunOnStart = runOnStart !== false ? runOnStart : cfg.scheduler.runOnStart;

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Cron Schedule</label>
        <input
          type="text"
          value={currentSchedule}
          onChange={(e) => setCronSchedule(e.target.value)}
          placeholder="0 */8 * * *"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-maintainerr-red font-mono"
        />
        <p className="mt-1 text-xs text-gray-500">
          Default: <code className="font-mono">0 */8 * * *</code> (every 8 hours).
          Use <a href="https://crontab.guru" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">crontab.guru</a> to build expressions.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">Run on startup</p>
          <p className="text-xs text-gray-500 mt-0.5">Execute once when the container starts.</p>
        </div>
        <button
          onClick={() => setRunOnStart(!currentRunOnStart)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${currentRunOnStart ? 'bg-maintainerr-red' : 'bg-gray-700'}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${currentRunOnStart ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </button>
      </div>

      {saved && <p className="text-green-400 text-sm">Saved.</p>}

      <button
        onClick={() =>
          saveMutation.mutate({ cronSchedule: currentSchedule, runOnStart: currentRunOnStart })
        }
        disabled={saveMutation.isPending}
        className="px-4 py-2 bg-maintainerr-red hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded font-medium"
      >
        Save
      </button>

      <div className="bg-gray-800/50 rounded p-4 space-y-2 text-xs text-gray-400">
        <p className="font-medium text-gray-300 text-sm">Processing options</p>
        <ProcessingOptions cfg={cfg} />
      </div>
    </div>
  );
}

function ProcessingOptions({ cfg }: { cfg: AppConfig }) {
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (values: Partial<AppConfig['processing']>) =>
      updateConfig({ processing: { ...cfg.processing, ...values } } as Partial<AppConfig>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span>Reapply overlay every run</span>
        <button
          onClick={() => saveMutation.mutate({ reapplyOverlay: !cfg.processing.reapplyOverlay })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cfg.processing.reapplyOverlay ? 'bg-maintainerr-red' : 'bg-gray-700'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${cfg.processing.reapplyOverlay ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span>Force JPEG upload</span>
        <button
          onClick={() => saveMutation.mutate({ forceJpegUpload: !cfg.processing.forceJpegUpload })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cfg.processing.forceJpegUpload ? 'bg-maintainerr-red' : 'bg-gray-700'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${cfg.processing.forceJpegUpload ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
      <p className="text-xs text-gray-600 -mt-1">
        To select which collections to process and configure sort order, use the Collections page.
      </p>
    </div>
  );
}
