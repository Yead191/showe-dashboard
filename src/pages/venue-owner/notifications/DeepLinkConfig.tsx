import { Plus, X, MousePointerClick, Info, Hash } from 'lucide-react';
import { Button, Select, Tooltip } from 'antd';
import { DEEP_LINK_SCREENS } from '@/constants/notifications';

export interface DeepLinkParam {
    id: string;
    key: string;
    value: string;
}

interface DeepLinkConfigProps {
    screen: string | null;
    params: DeepLinkParam[];
    onScreenChange: (screen: string | null) => void;
    onParamsChange: (params: DeepLinkParam[]) => void;
}

function genParamId() {
    return `dlp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function DeepLinkConfig({
    screen,
    params,
    onScreenChange,
    onParamsChange,
}: DeepLinkConfigProps) {
    // console.log(selectedEvent)
    const selectedScreen = DEEP_LINK_SCREENS.find((s) => s.value === screen);
    const pathParamKey = selectedScreen?.pathParam;

    const pathParamEntry = pathParamKey
        ? params.find((p) => p.key === pathParamKey) ?? null
        : null;
    const queryParams = params.filter((p) => p.key !== pathParamKey);

    function updateParam(id: string, patch: Partial<DeepLinkParam>) {
        onParamsChange(params.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    }
    function removeParam(id: string) {
        onParamsChange(params.filter((p) => p.id !== id));
    }
    function addQueryParam(key = '') {
        onParamsChange([...params, { id: genParamId(), key, value: '' }]);
    }
    function fillSuggestedParams() {
        if (!selectedScreen) return;
        const existingKeys = new Set(params.map((p) => p.key.trim()).filter(Boolean));
        const toAdd = selectedScreen.suggestedParams
            .filter((k) => !existingKeys.has(k))
            .map((k) => ({ id: genParamId(), key: k, value: '' }));
        if (toAdd.length === 0) return;
        onParamsChange([...params, ...toAdd]);
    }

    return (
        <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-4 space-y-4">
            {/* Screen selector */}
            <div>
                <label className="field-label flex items-center gap-1.5">
                    <MousePointerClick size={12} />
                    Target screen
                    <span className="text-[10.5px] font-normal text-ink-faint normal-case tracking-normal">
                        — pick the in-app screen to open on tap
                    </span>
                </label>
                <Select
                    allowClear
                    placeholder="Select a destination screen"
                    value={screen ?? undefined}
                    onChange={(v) => onScreenChange(v ?? null)}
                    className="w-full premium-select"
                    size="large"
                    showSearch
                    options={DEEP_LINK_SCREENS.map((s) => ({
                        value: s.value,
                        label: s.label,
                    }))}
                    optionRender={(option) => {
                        const s = DEEP_LINK_SCREENS.find((d) => d.value === option.value);
                        if (!s) return option.label;
                        return (
                            <div className="py-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-ink">{s.label}</span>
                                    <span className="text-[10.5px] font-mono text-ink-faint">{s.value}</span>
                                    {s.pathParam && (
                                        <span className="text-[10px] font-mono text-primary/60">
                                            /:{s.pathParam}
                                        </span>
                                    )}
                                </div>
                                <div className="text-[11.5px] text-ink-faint leading-snug mt-0.5">
                                    {s.description}
                                </div>
                            </div>
                        );
                    }}
                    filterOption={(input, option) => {
                        if (!input) return true;
                        const needle = input.toLowerCase();
                        const s = DEEP_LINK_SCREENS.find((d) => d.value === option?.value);
                        if (!s) return false;
                        return (
                            s.value.toLowerCase().includes(needle) ||
                            s.label.toLowerCase().includes(needle) ||
                            s.description.toLowerCase().includes(needle)
                        );
                    }}
                />
                {selectedScreen && (
                    <div className="mt-2 flex items-start gap-2 text-[12px] text-ink-muted">
                        <Info size={12} className="mt-0.5 shrink-0 text-primary" />
                        <span className="leading-snug">{selectedScreen.description}</span>
                    </div>
                )}
            </div>

            {/* Path param — shown only when screen has an embedded ID segment */}
            {pathParamKey && (
                <div>
                    <label className="field-label flex items-center gap-1.5">
                        <Hash size={12} />
                        Path ID
                        <span className="text-[10.5px] font-normal text-ink-faint normal-case tracking-normal">
                            — embedded in the URL, e.g.{' '}
                            <span className="font-mono">
                                {screen}/{pathParamEntry?.value || '123'}
                            </span>
                        </span>
                    </label>
                    <input
                        // defaultValue={}
                        value={pathParamEntry?.value ?? ''}
                        onChange={(e) => {
                            if (pathParamEntry) {
                                updateParam(pathParamEntry.id, { value: e.target.value });
                            } else {
                                onParamsChange([
                                    ...params,
                                    { id: genParamId(), key: pathParamKey, value: e.target.value },
                                ]);
                            }
                        }}
                        placeholder={`Enter ${pathParamKey}`}
                        className="input-base !h-10 !rounded-lg !text-[13px] font-mono w-full"
                    />
                </div>
            )}

            {/* Query params */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="field-label !mb-0">
                        Query params
                        <span className="ml-1.5 text-[10.5px] font-normal text-ink-faint normal-case tracking-normal">
                            appended as <span className="font-mono">?key=value</span>
                        </span>
                    </label>
                    <div className="flex items-center gap-2">
                        {selectedScreen && selectedScreen.suggestedParams.length > 0 && (
                            <Tooltip
                                title={`Suggested for ${selectedScreen.label}: ${selectedScreen.suggestedParams.join(', ')}`}
                            >
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={fillSuggestedParams}
                                    className="!px-1 !h-auto !text-[11.5px] font-bold"
                                >
                                    + Suggested
                                </Button>
                            </Tooltip>
                        )}
                        <Button
                            size="small"
                            icon={<Plus size={11} />}
                            onClick={() => addQueryParam()}
                            className="!h-7 !rounded-lg !text-[11.5px] font-semibold"
                        >
                            Add param
                        </Button>
                    </div>
                </div>

                {queryParams.length === 0 ? (
                    <div className="text-[12.5px] text-ink-faint italic px-3 py-3 rounded-lg bg-surface-sunken/60 border border-dashed border-line">
                        No query params yet — add <span className="font-mono text-ink-muted">page</span>,{' '}
                        <span className="font-mono text-ink-muted">tab</span>, or any extra context to pass along.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {queryParams.map((p) => (
                            <div key={p.id} className="flex items-center gap-2">
                                <input
                                    value={p.key}
                                    onChange={(e) => updateParam(p.id, { key: e.target.value })}
                                    placeholder="key"
                                    className="input-base !h-10 !rounded-lg flex-[0.7] !text-[12.5px] font-mono"
                                />
                                <span className="text-ink-faint text-xs font-mono">=</span>
                                <input
                                    value={p.value}
                                    onChange={(e) => updateParam(p.id, { value: e.target.value })}
                                    placeholder="value"
                                    className="input-base !h-10 !rounded-lg flex-1 !text-[12.5px]"
                                />
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<X size={14} />}
                                    onClick={() => removeParam(p.id)}
                                    aria-label="Remove parameter"
                                    className="!w-9 !h-9 !rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
