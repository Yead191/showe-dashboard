import { Smartphone, Globe } from 'lucide-react';
import { DEEP_LINK_SCREENS, type NotificationPlatform } from '@/constants/notifications';
import type { DeepLinkParam } from './DeepLinkConfig';

const WEB_ORIGIN = 'https://showe-web.vercel.app';

export function buildDeepLinkPath(screen: string | null, params: DeepLinkParam[]): string {
    if (!screen) return '';
    const screenDef = DEEP_LINK_SCREENS.find((s) => s.value === screen);
    const pathParamKey = screenDef?.pathParam;
    const pathParamEntry = pathParamKey ? params.find((p) => p.key === pathParamKey) : null;
    const queryEntries = params.filter((p) => p.key.trim() && p.key !== pathParamKey);

    const pathPart = pathParamEntry?.value ? `${screen}/${pathParamEntry.value}` : screen;
    const qsPart =
        queryEntries.length > 0
            ? `?${queryEntries.map((p) => `${p.key}=${p.value || '…'}`).join('&')}`
            : '';
    return `${pathPart}${qsPart}`;
}

interface TapBehaviourPreviewProps {
    platform: NotificationPlatform;
    destinationScreen: string | null;
    destinationParams: DeepLinkParam[];
}

export default function TapBehaviourPreview({
    platform,
    destinationScreen,
    destinationParams,
}: TapBehaviourPreviewProps) {
    const preset = DEEP_LINK_SCREENS.find((s) => s.value === destinationScreen);
    const resolvedPath = buildDeepLinkPath(destinationScreen, destinationParams);
    const showApp = platform === 'app' || platform === 'both';
    const showWeb = platform === 'web' || platform === 'both';

    if (!destinationScreen) {
        return (
            <div className="rounded-xl border border-dashed border-line bg-surface-sunken/60 p-4 text-[12.5px] text-ink-faint italic">
                Pick a destination screen to preview where users will land.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    {preset?.label ?? destinationScreen}
                </span>
                <span className="text-[11px] text-ink-faint truncate">
                    {preset?.description ?? 'Make sure your app + web router handles this path.'}
                </span>
            </div>

            {showApp && (
                <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                            <Smartphone size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10.5px] font-bold uppercase tracking-wider text-primary/80">
                                Mobile app
                            </div>
                            <div className="text-[12px] text-ink-muted">Opens native screen</div>
                        </div>
                    </div>
                    <div className="font-mono text-[11px] text-ink-muted bg-surface-raised border border-line rounded-lg p-2 break-all">
                        {resolvedPath}
                    </div>
                </div>
            )}

            {showWeb && (
                <div className="rounded-xl border border-info/20 bg-info/[0.04] p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-info/15 text-info flex items-center justify-center">
                            <Globe size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10.5px] font-bold uppercase tracking-wider text-info/80">
                                Web
                            </div>
                            <div className="text-[12px] text-ink-muted">Navigates in browser</div>
                        </div>
                    </div>
                    <div className="font-mono text-[11px] text-ink-muted bg-surface-raised border border-line rounded-lg p-2 break-all">
                        {WEB_ORIGIN}{resolvedPath}
                    </div>
                </div>
            )}
        </div>
    );
}
