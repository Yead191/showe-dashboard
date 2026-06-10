import { memo, useMemo } from 'react';
import { CornerDownLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlatSearchItem {
    label: string;
    to: string;
    icon: LucideIcon;
    badge?: string;
    category: string;
}

interface SearchSuggestionsProps {
    isOpen: boolean;
    query: string;
    filteredResults: FlatSearchItem[];
    selectedIndex: number;
    onSelect: (to: string) => void;
    setSelectedIndex: (index: number) => void;
}

export const SearchSuggestions = memo(function SearchSuggestions({
    isOpen,
    query,
    filteredResults,
    selectedIndex,
    onSelect,
    setSelectedIndex,
}: SearchSuggestionsProps) {
    if (!isOpen) return null;

    const groupedResults = useMemo(() => {
        const groups: Record<string, FlatSearchItem[]> = {};
        filteredResults.forEach((item) => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [filteredResults]);

    if (filteredResults.length === 0) {
        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-base border border-line/80 rounded-2xl shadow-xl z-50 p-6 text-center text-ink-muted text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                No directory items match <span className="font-semibold text-ink">"{query}"</span>
            </div>
        );
    }

    return (
        /* OUTER FRAME: Holds the rounded corners, border, and shadows securely */
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-base border border-line/80 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

            {/* INNER CONTAINER: Handles max-height, scrolling, right-side gutter padding,
        and premium custom webkit scrollbar utilities.
      */}
            <div
                className={cn(
                    "max-h-[380px] overflow-y-auto p-2 pr-1.5",
                    /* Custom Webkit Styles to make it look sleek and floating */
                    "[&::-webkit-scrollbar]:w-1",
                    "[&::-webkit-scrollbar-track]:bg-transparent",
                    "[&::-webkit-scrollbar-thumb]:bg-ink-faint/20",
                    "hover:[&::-webkit-scrollbar-thumb]:bg-ink-faint/40",
                    "[&::-webkit-scrollbar-thumb]:rounded-full"
                )}
            >
                {(() => {
                    let globalFlatIndex = 0;

                    return Object.entries(groupedResults).map(([category, items]) => (
                        <div key={category} className="mb-2 last:mb-0">
                            <div className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-faint">
                                {category}
                            </div>
                            <div className="space-y-0.5">
                                {items.map((item) => {
                                    const isCurrentSelection = globalFlatIndex === selectedIndex;
                                    const currentCapturedIndex = globalFlatIndex;
                                    globalFlatIndex++;

                                    const IconComponent = item.icon;

                                    return (
                                        <button
                                            key={item.to}
                                            onMouseEnter={() => setSelectedIndex(currentCapturedIndex)}
                                            onClick={() => onSelect(item.to)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 h-10 rounded-xl text-left transition-all duration-150",
                                                isCurrentSelection
                                                    ? "bg-primary text-ink-inverse shadow-sm shadow-primary/10"
                                                    : "text-ink hover:bg-surface-sunken"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <IconComponent
                                                    size={16}
                                                    className={cn(isCurrentSelection ? "text-ink-inverse" : "text-ink-muted")}
                                                />
                                                <span className="text-sm font-medium truncate">{item.label}</span>
                                                {item.badge && (
                                                    <span
                                                        className={cn(
                                                            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide",
                                                            isCurrentSelection
                                                                ? "bg-ink-inverse text-primary"
                                                                : "bg-primary/10 text-primary border border-primary/20"
                                                        )}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>

                                            {isCurrentSelection && (
                                                <span className="flex items-center gap-0.5 text-[10px] font-medium opacity-80 animate-in fade-in duration-200">
                                                    Jump to <CornerDownLeft size={10} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ));
                })()}
            </div>
        </div>
    );
});