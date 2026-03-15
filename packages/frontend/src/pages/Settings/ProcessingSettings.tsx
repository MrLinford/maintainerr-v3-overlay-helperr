import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfig, updateConfig, AppConfig } from '../../api/config';
import { getCollections } from '../../api/collections';

type ProcessingConfig = AppConfig['processing'];

export default function ProcessingSettings() {
  const qc = useQueryClient();
  const { data: cfg, isLoading: cfgLoading } = useQuery({
    queryKey: ['config'],
    queryFn: getConfig,
  });

  const [saved, setSaved] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (partial: Partial<AppConfig>) => updateConfig(partial),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ['config'] });
      setTimeout(() => setSaved(false), 2000);
    },
  });

  // Only fetch collections when Maintainerr is configured
  const maintainerrUrl = cfg?.maintainerr.url ?? '';
  const {
    data: collections,
    isLoading: collLoading,
    isError: collError,
  } = useQuery({
    queryKey: ['collections'],
    queryFn: getCollections,
    enabled: !!maintainerrUrl,
    retry: false,
  });

  if (cfgLoading || !cfg) return <p className="text-gray-400">Loading…</p>;

  const proc = cfg.processing;

  // Backend treats [] and ['*'] both as "process all"
  const processAll =
    proc.processCollections.length === 0 || proc.processCollections.includes('*');
  const selectedTitles = new Set(proc.processCollections);

  const saveProcessing = (partial: Partial<ProcessingConfig>) => {
    saveMutation.mutate({ processing: { ...proc, ...partial } });
  };

  const handleProcessAllToggle = (all: boolean) => {
    if (all) {
      saveProcessing({ processCollections: ['*'] });
    } else {
      // Seed the selective list with all loaded collection titles so every
      // checkbox starts checked — the user can then uncheck what they don't want.
      // If collections haven't loaded yet, keep '*' (stay in process-all mode).
      const allTitles = collections?.map((c) => c.title) ?? [];
      saveProcessing({ processCollections: allTitles.length > 0 ? allTitles : ['*'] });
    }
  };

  const handleCollectionToggle = (title: string, checked: boolean) => {
    // Only reachable when processAll = false (checkboxes are hidden otherwise).
    const current = [...selectedTitles];
    const updated = checked
      ? [...new Set([...current, title])]
      : current.filter((t) => t !== title);
    // If everything is unchecked fall back to process-all rather than silently
    // processing nothing.
    saveProcessing({ processCollections: updated.length === 0 ? ['*'] : updated });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {saved && <p className="text-green-400 text-sm">Saved.</p>}

      {/* Collections */}
      <Section title="Collections">
        <Row label="Process all collections">
          <Toggle value={processAll} onChange={handleProcessAllToggle} />
        </Row>

        {!processAll && (
          <div className="mt-2">
            {!maintainerrUrl && (
              <p className="text-xs text-yellow-500">
                Configure Maintainerr URL first to load available collections.
              </p>
            )}
            {maintainerrUrl && collLoading && (
              <p className="text-xs text-gray-400">Loading collections…</p>
            )}
            {maintainerrUrl && collError && (
              <p className="text-xs text-red-400">
                Could not reach Maintainerr. Check your connection settings.
              </p>
            )}
            {collections && collections.length === 0 && (
              <p className="text-xs text-gray-500">No collections found in Maintainerr.</p>
            )}
            {collections && collections.length > 0 && (
              <div className="space-y-1 mt-1">
                {collections.map((coll) => {
                  const isChecked = selectedTitles.has(coll.title);
                  return (
                    <label
                      key={coll.id}
                      className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleCollectionToggle(coll.title, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-maintainerr-red cursor-pointer"
                      />
                      <span className="flex-1 text-sm text-white">{coll.title}</span>
                      {coll.deleteAfterDays ? (
                        <span className="text-xs text-gray-500">
                          {coll.deleteAfterDays}d
                        </span>
                      ) : (
                        <span className="text-xs text-gray-700">no date set</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Run behaviour */}
      <Section title="Run Behaviour">
        <Row label="Reapply overlay on every run">
          <Toggle
            value={proc.reapplyOverlay}
            onChange={(v) => saveProcessing({ reapplyOverlay: v })}
          />
        </Row>
        <p className="text-xs text-gray-600 -mt-1 ml-0 col-span-2">
          When off, overlays are only re-rendered when the delete date changes.
        </p>
        <Row label="Force JPEG upload">
          <Toggle
            value={proc.forceJpegUpload}
            onChange={(v) => saveProcessing({ forceJpegUpload: v })}
          />
        </Row>
      </Section>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 items-center">
      <label className="text-sm text-gray-400">{label}</label>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        value ? 'bg-maintainerr-red' : 'bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          value ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
