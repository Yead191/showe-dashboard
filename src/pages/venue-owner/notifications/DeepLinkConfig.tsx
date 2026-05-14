import { Plus, X, MousePointerClick, Info } from 'lucide-react';
import { Button, AutoComplete, Tooltip } from 'antd';
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
    const selectedScreen = DEEP_LINK_SCREENS.find((s) => s.value === screen);

    function updateParam(id: string, patch: Partial<DeepLinkParam>) {
        onParamsChange(params.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    }
    function removeParam(id: string) {
        onParamsChange(params.filter((p) => p.id !== id));
    }
    function addParam(key = '') {
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
            <div>
                <label className="field-label flex items-center gap-1.5">
                    <MousePointerClick size={12} />
                    Target screen
                    <span className="text-[10.5px] font-normal text-ink-faint normal-case tracking-normal">
                        — pick a suggestion or type your own route
                    </span>
                </label>
                <AutoComplete
                    allowClear
                    placeholder="/poll, /survey, or any custom route"
                    value={screen ?? ''}
                    onChange={(v) => onScreenChange(v && v.trim() ? v.trim() : null)}
                    className="w-full premium-select"
                    size="large"
                    options={DEEP_LINK_SCREENS.map((s) => ({
                        value: s.value,
                        label: (
                            <div className="py-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-ink">{s.label}</span>
                                    <span className="text-[10.5px] font-mono text-ink-faint">{s.value}</span>
                                </div>
                                <div className="text-[11.5px] text-ink-faint leading-snug mt-0.5">
                                    {s.description}
                                </div>
                            </div>
                        ),
                    }))}
                    filterOption={(input, option) => {
                        if (!input) return true;
                        const needle = input.toLowerCase();
                        const screenDef = DEEP_LINK_SCREENS.find((s) => s.value === option?.value);
                        if (!screenDef) return false;
                        return (
                            screenDef.value.toLowerCase().includes(needle) ||
                            screenDef.label.toLowerCase().includes(needle) ||
                            screenDef.description.toLowerCase().includes(needle)
                        );
                    }}
                />
                {selectedScreen ? (
                    <div className="mt-2 flex items-start gap-2 text-[12px] text-ink-muted">
                        <Info size={12} className="mt-0.5 shrink-0 text-primary" />
                        <span className="leading-snug">{selectedScreen.description}</span>
                    </div>
                ) : screen ? (
                    <div className="mt-2 flex items-start gap-2 text-[12px] text-ink-faint">
                        <Info size={12} className="mt-0.5 shrink-0 text-amber" />
                        <span className="leading-snug">
                            Custom route — make sure your app + web router both handle{' '}
                            <span className="font-mono text-ink-muted">{screen}</span>.
                        </span>
                    </div>
                ) : null}
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="field-label !mb-0">Parameters</label>
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
                            onClick={() => addParam()}
                            className="!h-7 !rounded-lg !text-[11.5px] font-semibold"
                        >
                            Add parameter
                        </Button>
                    </div>
                </div>

                {params.length === 0 ? (
                    <div className="text-[12.5px] text-ink-faint italic px-3 py-3 rounded-lg bg-surface-sunken/60 border border-dashed border-line">
                        No parameters yet. The screen will open with no context — add keys like{' '}
                        <span className="font-mono text-ink-muted">poll_id</span> to deep-link straight into an item.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {params.map((p) => (
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
