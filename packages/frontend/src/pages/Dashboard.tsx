import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProcessorStatus, startRun, resetOverlays } from '../api/processor';
import StatusBadge from '../components/StatusBadge';
import LogViewer from '../components/LogViewer';

export default function Dashboard() {
  const qc = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ['processor-status'],
    queryFn: getProcessorStatus,
    refetchInterval: 3000,
  });

  const runMutation = useMutation({
    mutationFn: startRun,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['processor-status'] }),
  });

  const resetMutation = useMutation({
    mutationFn: resetOverlays,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['processor-status'] }),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      {/* Status card */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400">Processor</h3>
          {!isLoading && status && (
            <StatusBadge status={status.status} />
          )}
        </div>

        {status?.lastRun && (
          <p className="text-xs text-gray-500">
            Last run: {new Date(status.lastRun).toLocaleString()}
          </p>
        )}

        {status?.lastResult && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Applied',  value: status.lastResult.processed },
              { label: 'Reverted', value: status.lastResult.reverted },
              { label: 'Skipped',  value: status.lastResult.skipped },
              { label: 'Errors',   value: status.lastResult.errors },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-800 rounded p-3 text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => runMutation.mutate()}
            disabled={status?.status === 'running' || runMutation.isPending}
            className="px-4 py-2 bg-maintainerr-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded font-medium transition-colors"
          >
            {status?.status === 'running' ? 'Running...' : 'Run Now'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('This will revert all overlay posters. Continue?')) {
                resetMutation.mutate();
              }
            }}
            disabled={status?.status === 'running' || resetMutation.isPending}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded font-medium transition-colors"
          >
            Reset All Overlays
          </button>
        </div>
      </div>

      {/* Live logs */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Live Logs</h3>
        <div className="flex-1 min-h-0">
          <LogViewer maxLines={100} autoScroll />
        </div>
      </div>
    </div>
  );
}
