import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfig, updateConfig, AppConfig } from '../../api/config';
import { getRandomPreviewItem } from '../../api/preview';

type OverlayStyle = AppConfig['overlayStyle'];
type OverlayText  = AppConfig['overlayText'];
type FrameConfig  = AppConfig['frame'];

export default function OverlaySettings() {
  const qc = useQueryClient();
  const { data: cfg, isLoading } = useQuery({ queryKey: ['config'], queryFn: getConfig });

  const [saved, setSaved] = useState(false);

  // ── Preview state ────────────────────────────────────────────────────────
  const [previewPlexId, setPreviewPlexId] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle]   = useState('');
  const [previewKey, setPreviewKey]       = useState(0);
  const [loadingPoster, setLoadingPoster] = useState(false);
  const [previewImgError, setPreviewImgError] = useState(false);

  const fetchRandomPoster = useCallback(async () => {
    setLoadingPoster(true);
    setPreviewImgError(false);
    try {
      const item = await getRandomPreviewItem();
      setPreviewPlexId(item.plexId);
      setPreviewTitle(item.title);
      setPreviewKey((k) => k + 1);
    } catch {
      setPreviewImgError(true);
    } finally {
      setLoadingPoster(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomPoster();
  }, [fetchRandomPoster]);

  // ── Config save ──────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (partial: Partial<AppConfig>) => updateConfig(partial),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ['config'] });
      setPreviewKey((k) => k + 1);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading || !cfg) return <p className="text-gray-400">Loading…</p>;

  const style = cfg.overlayStyle;
  const text  = cfg.overlayText;
  const frame = cfg.frame;

  const handleStyleChange = (key: keyof OverlayStyle, value: OverlayStyle[typeof key]) => {
    saveMutation.mutate({ overlayStyle: { ...style, [key]: value } });
  };
  const handleTextChange = (key: keyof OverlayText, value: OverlayText[typeof key]) => {
    saveMutation.mutate({ overlayText: { ...text, [key]: value } });
  };
  const handleFrameChange = (key: keyof FrameConfig, value: FrameConfig[typeof key]) => {
    saveMutation.mutate({ frame: { ...frame, [key]: value } });
  };

  const previewSrc = previewPlexId
    ? `/api/preview?plexId=${encodeURIComponent(previewPlexId)}&_t=${previewKey}`
    : null;

  const isRendering = saveMutation.isPending || loadingPoster;

  return (
    <div className="flex gap-6 max-w-5xl">
      {/* ── Settings column ───────────────────────────────────────────────── */}
      <div className="flex-1 space-y-8 min-w-0">
        {saved && <p className="text-green-400 text-sm">Saved.</p>}

        {/* Text settings */}
        <Section title="Text">
          <Row label="Use 'Days Left' mode">
            <Toggle value={text.useDays} onChange={(v) => handleTextChange('useDays', v)} />
          </Row>
          {!text.useDays && (
            <Row label="Overlay Prefix">
              <TextField value={text.overlayText}
                onChange={(v) => handleTextChange('overlayText', v)}
                className={inputCls} />
            </Row>
          )}
          {text.useDays && (
            <>
              <Row label="Today text"><TextField value={text.textToday} onChange={(v) => handleTextChange('textToday', v)} className={inputCls} /></Row>
              <Row label="1-day text"><TextField value={text.textDay} onChange={(v) => handleTextChange('textDay', v)} className={inputCls} /></Row>
              <Row label="Multi-day text ({0} = number)"><TextField value={text.textDays} onChange={(v) => handleTextChange('textDays', v)} className={inputCls} /></Row>
            </>
          )}
          {!text.useDays && (
            <>
              <Row label="Date format">
                <TextField value={text.dateFormat} onChange={(v) => handleTextChange('dateFormat', v)} className={inputCls} placeholder="MMM d" />
              </Row>
              <Row label="Day suffix (st/nd/rd/th)">
                <Toggle value={text.enableDaySuffix} onChange={(v) => handleTextChange('enableDaySuffix', v)} />
              </Row>
              <Row label="Language (BCP-47)">
                <TextField value={text.language} onChange={(v) => handleTextChange('language', v)} className={inputCls} placeholder="en-US" />
              </Row>
            </>
          )}
          <Row label="Uppercase">
            <Toggle value={text.enableUppercase} onChange={(v) => handleTextChange('enableUppercase', v)} />
          </Row>
        </Section>

        {/* Style settings */}
        <Section title="Style">
          <Row label="Font Path">
            <TextField value={style.fontPath} onChange={(v) => handleStyleChange('fontPath', v)} className={inputCls} />
          </Row>
          <Row label="Font Color">
            <ColorField value={style.fontColor} onChange={(v) => handleStyleChange('fontColor', v)} />
          </Row>
          <Row label="Background Color">
            <ColorField value={style.backColor} onChange={(v) => handleStyleChange('backColor', v)} />
          </Row>
          <Row label="Font Size (% of height)">
            <NumberField value={style.fontSize} onChange={(v) => handleStyleChange('fontSize', v)} step={0.1} />
          </Row>
          <Row label="Padding (% of height)">
            <NumberField value={style.padding} onChange={(v) => handleStyleChange('padding', v)} step={0.1} />
          </Row>
          <Row label="Corner Radius (% of height)">
            <NumberField value={style.backRadius} onChange={(v) => handleStyleChange('backRadius', v)} step={0.1} />
          </Row>

          {/* Position controls — only meaningful in standalone pill mode (no frame) */}
          {!frame.useFrame ? (
            <>
              <Row label="Horizontal Align">
                <Select value={style.horizontalAlign} options={['left', 'center', 'right']} onChange={(v) => handleStyleChange('horizontalAlign', v as OverlayStyle['horizontalAlign'])} />
              </Row>
              <Row label="Horizontal Offset (% of width)">
                <NumberField value={style.horizontalOffset} onChange={(v) => handleStyleChange('horizontalOffset', v)} step={0.5} />
              </Row>
              <Row label="Vertical Align">
                <Select value={style.verticalAlign} options={['top', 'center', 'bottom']} onChange={(v) => handleStyleChange('verticalAlign', v as OverlayStyle['verticalAlign'])} />
              </Row>
              <Row label="Vertical Offset (% of height)">
                <NumberField value={style.verticalOffset} onChange={(v) => handleStyleChange('verticalOffset', v)} step={0.5} />
              </Row>
              <Row label="Force Bottom Center">
                <Toggle value={style.overlayBottomCenter} onChange={(v) => handleStyleChange('overlayBottomCenter', v)} />
              </Row>
            </>
          ) : (
            <p className="text-xs text-gray-500 pt-1">
              Position is controlled by Dock Position when Frame is enabled.
            </p>
          )}
        </Section>

        {/* Frame settings */}
        <Section title="Frame / Dock">
          <Row label="Enable Frame">
            <Toggle value={frame.useFrame} onChange={(v) => handleFrameChange('useFrame', v)} />
          </Row>
          {frame.useFrame && (
            <>
              <Row label="Frame Color">
                <ColorField value={frame.frameColor} onChange={(v) => handleFrameChange('frameColor', v)} />
              </Row>
              <Row label="Frame Width (% of short side)">
                <NumberField value={frame.frameWidth} onChange={(v) => handleFrameChange('frameWidth', v)} step={0.1} />
              </Row>
              <Row label="Frame Radius (% of short side)">
                <NumberField value={frame.frameRadius} onChange={(v) => handleFrameChange('frameRadius', v)} step={0.1} />
              </Row>
              <Row label="Frame Inset">
                <Select
                  value={frame.frameInset}
                  options={[
                    { value: 'outside', label: 'outside — edge to edge' },
                    { value: 'flush',   label: 'flush — centered on edge' },
                    { value: 'inside',  label: 'inside — inset by one width' },
                  ]}
                  onChange={(v) => handleFrameChange('frameInset', v as FrameConfig['frameInset'])}
                />
              </Row>
              <Row label="Dock Style">
                <Select value={frame.dockStyle} options={['pill', 'bar']} onChange={(v) => handleFrameChange('dockStyle', v as FrameConfig['dockStyle'])} />
              </Row>
              <Row label="Dock Position">
                <Select value={frame.dockPosition} options={['top', 'bottom']} onChange={(v) => handleFrameChange('dockPosition', v as FrameConfig['dockPosition'])} />
              </Row>
            </>
          )}
        </Section>
      </div>

      {/* ── Preview column ────────────────────────────────────────────────── */}
      <div className="w-52 shrink-0">
        <div className="sticky top-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
            Preview
          </h4>

          <div
            className="relative rounded overflow-hidden bg-gray-900"
            style={{ aspectRatio: '2 / 3' }}
          >
            {previewSrc && !previewImgError ? (
              <img
                key={`${previewPlexId}-${previewKey}`}
                src={previewSrc}
                alt="Overlay preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewImgError(true)}
                onLoad={() => setPreviewImgError(false)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <span className="text-gray-600 text-xs text-center leading-relaxed">
                  {previewImgError
                    ? 'Could not load preview. Check your Plex connection.'
                    : 'Select a poster to preview.'}
                </span>
              </div>
            )}

            {isRendering && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs">Rendering…</span>
              </div>
            )}
          </div>

          {previewTitle && (
            <p className="text-xs text-gray-500 mt-1.5 truncate" title={previewTitle}>
              {previewTitle}
            </p>
          )}

          <button
            onClick={fetchRandomPoster}
            disabled={loadingPoster}
            className="mt-2 w-full text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded py-1.5 transition-colors disabled:opacity-40"
          >
            {loadingPoster ? 'Loading…' : 'Use different poster'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-maintainerr-red';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">{title}</h4>
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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? 'bg-maintainerr-red' : 'bg-gray-700'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="color"
        value={value.length === 7 ? value : '#B20710'}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 rounded border border-gray-700 bg-transparent cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} flex-1`}
        placeholder="#RRGGBB"
      />
    </div>
  );
}

function NumberField({
  value,
  onChange,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  const [local, setLocal] = useState(String(value));
  const focused = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!focused.current) setLocal(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    const parsed = parseFloat(v);
    if (!isNaN(parsed)) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(parsed), 500);
    }
  };

  return (
    <input
      type="number"
      value={local}
      step={step}
      onChange={handleChange}
      onFocus={() => { focused.current = true; }}
      onBlur={() => {
        focused.current = false;
        if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
        const parsed = parseFloat(local);
        if (!isNaN(parsed)) onChange(parsed);
      }}
      className={inputCls}
    />
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useState(value);
  const focused = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!focused.current) setLocal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(v), 500);
  };

  return (
    <input
      type="text"
      value={local}
      onChange={handleChange}
      onFocus={() => { focused.current = true; }}
      onBlur={() => {
        focused.current = false;
        if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
        onChange(local);
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}

type SelectOption = string | { value: string; label: string };

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    >
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}
