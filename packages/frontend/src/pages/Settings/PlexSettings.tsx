import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfig, updateConfig, testPlexConnection, AppConfig } from '../../api/config';

export default function PlexSettings() {
  const qc = useQueryClient();
  const { data: cfg, isLoading } = useQuery({ queryKey: ['config'], queryFn: getConfig });

  const [form, setForm] = useState({ url: '', token: '' });
  const [testResult, setTestResult] = useState<boolean | null>(null);

  // Initialize form when config loads
  useState(() => {
    if (cfg) setForm({ url: cfg.plex.url, token: cfg.plex.token });
  });

  const saveMutation = useMutation({
    mutationFn: (values: { url: string; token: string }) =>
      updateConfig({ plex: values } as Partial<AppConfig>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  });

  const testMutation = useMutation({
    mutationFn: async (values: { url: string; token: string }) => {
      await updateConfig({ plex: values } as Partial<AppConfig>);
      return testPlexConnection();
    },
    onSuccess: (ok) => setTestResult(ok),
  });

  if (isLoading) return <p className="text-gray-400">Loading…</p>;

  const initialForm = { url: cfg?.plex.url ?? '', token: cfg?.plex.token ?? '' };

  return (
    <div className="max-w-lg space-y-5">
      <Field
        label="Plex URL"
        placeholder="http://localhost:32400"
        value={form.url || initialForm.url}
        onChange={(v) => setForm((f) => ({ ...f, url: v }))}
      />
      <Field
        label="Plex Token"
        type="password"
        placeholder="Your X-Plex-Token"
        value={form.token || initialForm.token}
        onChange={(v) => setForm((f) => ({ ...f, token: v }))}
      />

      {testResult !== null && (
        <p className={`text-sm ${testResult ? 'text-green-400' : 'text-red-400'}`}>
          {testResult ? 'Connection successful.' : 'Connection failed.'}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="px-4 py-2 bg-maintainerr-red hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded font-medium"
        >
          Save
        </button>
        <button
          onClick={() => testMutation.mutate(form)}
          disabled={testMutation.isPending}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm rounded font-medium"
        >
          Test Connection
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-maintainerr-red"
      />
    </div>
  );
}
