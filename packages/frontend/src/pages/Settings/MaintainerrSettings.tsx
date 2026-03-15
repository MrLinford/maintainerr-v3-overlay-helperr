import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfig, updateConfig, testMaintainerrConnection, AppConfig } from '../../api/config';

export default function MaintainerrSettings() {
  const qc = useQueryClient();
  const { data: cfg, isLoading } = useQuery({ queryKey: ['config'], queryFn: getConfig });

  const [url, setUrl] = useState('');
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const saveMutation = useMutation({
    mutationFn: (v: string) =>
      updateConfig({ maintainerr: { url: v } } as Partial<AppConfig>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  });

  const testMutation = useMutation({
    mutationFn: async (v: string) => {
      await updateConfig({ maintainerr: { url: v } } as Partial<AppConfig>);
      return testMaintainerrConnection();
    },
    onSuccess: (ok) => setTestResult(ok),
  });

  if (isLoading) return <p className="text-gray-400">Loading…</p>;

  const currentUrl = url || cfg?.maintainerr.url || '';

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Maintainerr URL</label>
        <input
          type="text"
          value={currentUrl}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:6246"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-maintainerr-red"
        />
      </div>

      {testResult !== null && (
        <p className={`text-sm ${testResult ? 'text-green-400' : 'text-red-400'}`}>
          {testResult ? 'Connection successful.' : 'Connection failed.'}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => saveMutation.mutate(currentUrl)}
          disabled={saveMutation.isPending}
          className="px-4 py-2 bg-maintainerr-red hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded font-medium"
        >
          Save
        </button>
        <button
          onClick={() => testMutation.mutate(currentUrl)}
          disabled={testMutation.isPending}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm rounded font-medium"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
}
