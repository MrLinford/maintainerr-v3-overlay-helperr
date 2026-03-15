import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCollections, Collection } from '../api/collections';
import { getConfig, updateConfig, AppConfig } from '../api/config';
import StatusBadge from '../components/StatusBadge';

export default function Collections() {
  const qc = useQueryClient();

  const { data: collections, isLoading, error } = useQuery({
    queryKey: ['collections'],
    queryFn: getCollections,
    refetchInterval: 30_000,
  });

  const { data: cfg } = useQuery({
    queryKey: ['config'],
    queryFn: getConfig,
  });

  const saveMutation = useMutation({
    mutationFn: (partial: Partial<AppConfig>) => updateConfig(partial),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  });

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const proc = cfg?.processing;
  const processAll =
    !proc ||
    proc.processCollections.length === 0 ||
    proc.processCollections.includes('*');
  const selectedTitles = new Set(proc?.processCollections ?? []);
  const globalReorderOnly = proc?.reorderOnly ?? false;
  const reorderOnlyTitles = new Set(proc?.reorderOnlyCollections ?? []);
  const globalSortOrder = proc?.collectionOrderGlobal ?? 'none';
  const collectionAscTitles = new Set((proc?.collectionAsc ?? []).map((t) => t.toLowerCase()));
  const collectionDescTitles = new Set((proc?.collectionDesc ?? []).map((t) => t.toLowerCase()));

  const saveProcessing = (partial: Partial<AppConfig['processing']>) => {
    if (!proc) return;
    saveMutation.mutate({ processing: { ...proc, ...partial } });
  };

  const handleProcessAllToggle = () => {
    if (processAll) {
      // Switch to selective: seed with all loaded collection titles so every
      // checkbox starts checked and the user can uncheck what they don't want.
      const allTitles = collections?.map((c) => c.title) ?? [];
      saveProcessing({ processCollections: allTitles.length > 0 ? allTitles : ['*'] });
    } else {
      saveProcessing({ processCollections: ['*'] });
    }
  };

  const handleCollectionToggle = (title: string, checked: boolean) => {
    const current = (proc?.processCollections ?? []).filter((t) => t !== '*');
    const updated = checked
      ? [...new Set([...current, title])]
      : current.filter((t) => t !== title);
    // If every collection is unchecked fall back to process-all.
    saveProcessing({ processCollections: updated.length === 0 ? ['*'] : updated });
  };

  const handleGlobalReorderOnlyToggle = () => {
    saveProcessing({ reorderOnly: !globalReorderOnly });
  };

  const handleCollectionReorderOnlyToggle = (title: string) => {
    if (globalReorderOnly) return;
    const current = proc?.reorderOnlyCollections ?? [];
    const isRO = reorderOnlyTitles.has(title);
    const updated = isRO
      ? current.filter((t) => t !== title)
      : [...new Set([...current, title])];
    saveProcessing({ reorderOnlyCollections: updated });
  };

  const handleGlobalSortChange = (value: AppConfig['processing']['collectionOrderGlobal']) => {
    saveProcessing({ collectionOrderGlobal: value });
  };

  const handleCollectionSortChange = (title: string, value: 'global' | 'asc' | 'desc') => {
    if (!proc) return;
    const removeTitle = (arr: string[]) =>
      arr.filter((t) => t.toLowerCase() !== title.toLowerCase());
    const newAsc = removeTitle(proc.collectionAsc ?? []);
    const newDesc = removeTitle(proc.collectionDesc ?? []);
    if (value === 'asc') newAsc.push(title);
    if (value === 'desc') newDesc.push(title);
    saveProcessing({ collectionAsc: newAsc, collectionDesc: newDesc });
  };

  const getCollectionSort = (title: string): 'global' | 'asc' | 'desc' => {
    const t = title.toLowerCase();
    if (collectionAscTitles.has(t)) return 'asc';
    if (collectionDescTitles.has(t)) return 'desc';
    return 'global';
  };

  if (isLoading) return <p className="text-gray-400">Loading collections…</p>;
  if (error) return <p className="text-red-400">Failed to load collections.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Collections</h2>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>Sort</span>
          <select
            value={globalSortOrder}
            onChange={(e) => handleGlobalSortChange(e.target.value as AppConfig['processing']['collectionOrderGlobal'])}
            disabled={saveMutation.isPending}
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-maintainerr-red disabled:opacity-50"
          >
            <option value="none">None</option>
            <option value="asc">Asc (soonest first)</option>
            <option value="desc">Desc (latest first)</option>
          </select>
          <div className="w-px h-4 bg-gray-700" />
          <span>Reorder only</span>
          <button
            onClick={handleGlobalReorderOnlyToggle}
            disabled={saveMutation.isPending}
            title="When on, collections are reordered but no overlays are applied"
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
              globalReorderOnly ? 'bg-maintainerr-red' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                globalReorderOnly ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <span>Process all</span>
          <button
            onClick={handleProcessAllToggle}
            disabled={saveMutation.isPending}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
              processAll ? 'bg-maintainerr-red' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                processAll ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {!processAll && (
        <p className="text-xs text-gray-500">
          Only checked collections will be processed. Changes save automatically.
        </p>
      )}

      {(collections ?? []).length === 0 && (
        <p className="text-gray-500 text-sm">No collections found in Maintainerr.</p>
      )}

      {(collections ?? []).map((coll: Collection) => {
        const appliedCount = coll.media.filter((m) => m.overlayState?.processed).length;
        const isIncluded = processAll || selectedTitles.has(coll.title);
        const collReorderOnly = globalReorderOnly || reorderOnlyTitles.has(coll.title);

        return (
          <div
            key={coll.id}
            className={`border rounded-lg overflow-hidden transition-colors ${
              !processAll && !isIncluded
                ? 'bg-gray-900/40 border-gray-800/40'
                : 'bg-gray-900 border-gray-800'
            }`}
          >
            <div className="flex items-center">
              {!processAll && (
                <div
                  className="pl-4 py-4 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isIncluded}
                    onChange={(e) => handleCollectionToggle(coll.title, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-maintainerr-red cursor-pointer"
                  />
                </div>
              )}

              {/* Per-collection reorder-only toggle */}
              <div
                className="pl-3 py-4 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleCollectionReorderOnlyToggle(coll.title)}
                  disabled={globalReorderOnly || saveMutation.isPending}
                  title={
                    globalReorderOnly
                      ? 'Reorder only (set globally)'
                      : collReorderOnly
                      ? 'Reorder only — click to disable'
                      : 'Overlay mode — click to enable reorder-only for this collection'
                  }
                  className={`text-xs font-medium px-1.5 py-0.5 rounded border transition-colors ${
                    collReorderOnly
                      ? 'bg-maintainerr-red/20 text-maintainerr-red border-maintainerr-red/40'
                      : 'bg-transparent text-gray-600 border-gray-700 hover:border-gray-500 hover:text-gray-400'
                  } ${globalReorderOnly ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                >
                  ⇅
                </button>
              </div>

              {/* Per-collection sort order */}
              <div
                className="pl-2 py-4 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  value={getCollectionSort(coll.title)}
                  onChange={(e) => handleCollectionSortChange(coll.title, e.target.value as 'global' | 'asc' | 'desc')}
                  disabled={saveMutation.isPending}
                  title="Sort order for this collection (overrides global)"
                  className={`bg-gray-800 border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-maintainerr-red disabled:opacity-50 cursor-pointer ${
                    getCollectionSort(coll.title) !== 'global'
                      ? 'border-maintainerr-red/40 text-maintainerr-red'
                      : 'border-gray-700 text-gray-600'
                  }`}
                >
                  <option value="global">↕ Global</option>
                  <option value="asc">↑ Asc</option>
                  <option value="desc">↓ Desc</option>
                </select>
              </div>

              <button
                className="flex-1 flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800/50 transition-colors"
                onClick={() => toggle(coll.id)}
              >
                <div>
                  <span
                    className={`font-medium ${
                      !processAll && !isIncluded ? 'text-gray-500' : 'text-white'
                    }`}
                  >
                    {coll.title}
                  </span>
                  {coll.manualCollection && coll.manualCollectionName && (
                    <span className="ml-2 text-xs text-gray-500">
                      → {coll.manualCollectionName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{coll.deleteAfterDays ?? '?'} days</span>
                  <span>{coll.media.length} items</span>
                  <span className="text-green-400 text-xs">{appliedCount} applied</span>
                  <span
                    className={`transition-transform ${expanded.has(coll.id) ? 'rotate-180' : ''}`}
                  >
                    ▾
                  </span>
                </div>
              </button>
            </div>

            {expanded.has(coll.id) && (
              <div className="border-t border-gray-800 divide-y divide-gray-800/50">
                {coll.media.length === 0 && (
                  <p className="px-5 py-3 text-sm text-gray-500">No media items.</p>
                )}
                {coll.media.map((item) => {
                  const overlayStatus = item.overlayState?.processed ? 'applied' : 'pending';

                  return (
                    <div key={item.id} className="px-5 py-3 flex items-center justify-between text-sm">
                      <div className="text-gray-300">
                        Plex ID:{' '}
                        <span className="font-mono text-gray-400">{item.mediaServerId}</span>
                        {item.overlayState?.deleteDate && (
                          <span className="ml-3 text-xs text-gray-500">
                            Deletes{' '}
                            {new Date(item.overlayState.deleteDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={overlayStatus} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
