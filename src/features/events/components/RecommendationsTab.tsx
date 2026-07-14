import { useMemo, useState } from 'react';
import { Utensils, Hotel, Wine, Sparkles, Check } from 'lucide-react';
import { Spin } from 'antd';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/helpers/getImageUrl';
import {
  mapApiRecommendationToRecommendation,
  useGetOrganizationRecommendationsQuery,
} from '@/store/api/organizationApi/recommendationApi';
import type { EventFormState } from '../types';

interface RecommendationsTabProps {
  state: EventFormState;
  update: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

type RecType = 'restaurants' | 'hotels' | 'bars';

const CATEGORY_BY_TAB: Record<RecType, string> = {
  restaurants: 'restrudants',
  hotels: 'hotel',
  bars: 'bar',
};

function matchesCategory(category: string, tab: RecType): boolean {
  const normalized = category.trim().toLowerCase();
  const expected = CATEGORY_BY_TAB[tab];
  if (normalized === expected) return true;
  if (tab === 'restaurants') {
    return normalized.startsWith('restrudant') || normalized === 'restaurant' || normalized === 'restaurants';
  }
  if (tab === 'hotels') return normalized === 'hotel' || normalized === 'hotels';
  if (tab === 'bars') return normalized === 'bar' || normalized === 'bars';
  return false;
}

export function RecommendationsTab({ state, update }: RecommendationsTabProps) {
  const [activeTab, setActiveTab] = useState<RecType>('restaurants');
  const { data, isLoading } = useGetOrganizationRecommendationsQuery({ page: 1, limit: 50 });

  const allItems = useMemo(
    () => (data?.recommendations ?? []).map(mapApiRecommendationToRecommendation),
    [data?.recommendations]
  );

  const byType = useMemo(
    () => ({
      restaurants: allItems.filter((i) => matchesCategory(i.category, 'restaurants')),
      hotels: allItems.filter((i) => matchesCategory(i.category, 'hotels')),
      bars: allItems.filter((i) => matchesCategory(i.category, 'bars')),
    }),
    [allItems]
  );

  const tabs = [
    {
      id: 'restaurants' as const,
      label: 'Restaurants',
      icon: Utensils,
      data: byType.restaurants,
      selectedKey: 'selected_restaurants' as const,
    },
    {
      id: 'hotels' as const,
      label: 'Hotels',
      icon: Hotel,
      data: byType.hotels,
      selectedKey: 'selected_hotels' as const,
    },
    {
      id: 'bars' as const,
      label: 'Bars',
      icon: Wine,
      data: byType.bars,
      selectedKey: 'selected_bars' as const,
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  const toggleSelection = (id: string) => {
    const key = currentTab.selectedKey;
    const currentSelected = state[key] as string[];
    if (currentSelected.includes(id)) {
      update(key, currentSelected.filter((x) => x !== id));
    } else {
      update(key, [...currentSelected, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-accent/8 border border-accent/30 p-4">
        <div className="flex items-start gap-3">
          <Sparkles size={16} className="text-[#8A5C00] shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm text-ink">Linked from Plan Your Trip</div>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Select the recommendations you want to feature for this event. These are pulled from
              your venue’s global list.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const selectedCount = (state[tab.selectedKey] as string[]).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-xl border p-4 text-center transition-all relative',
                isActive
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-line bg-surface-raised hover:border-ink-faint'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2',
                  isActive ? 'bg-primary text-white' : 'bg-surface-sunken text-ink-muted'
                )}
              >
                <Icon size={18} />
              </div>
              <div className="font-semibold text-ink text-sm">{tab.label}</div>
              <div className="text-[11px] text-ink-faint mt-1">
                {selectedCount} selected / {tab.data.length}
              </div>
              {selectedCount > 0 && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {selectedCount}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-ink flex items-center justify-between">
          <span>Available {activeTab}</span>
          <span className="text-xs font-normal text-ink-faint">
            {currentTab.data.length} items found
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {currentTab.data.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-faint border border-dashed border-line rounded-xl">
              No {activeTab} recommendations yet.
            </div>
          ) : (
            currentTab.data.map((item) => {
              const isSelected = (state[currentTab.selectedKey] as string[]).includes(item.id);
              const imageSrc = item.image ? getImageUrl(item.image) : '';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleSelection(item.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-line bg-surface-raised hover:border-ink-faint'
                  )}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-sunken">
                    {imageSrc ? (
                      <img src={imageSrc} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ink truncate">{item.name}</div>
                    <div className="text-[12px] text-ink-faint truncate">
                      {item.category} • {item.distance} • {item.price}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[11px] font-bold text-accent">★ {item.rating}</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border flex items-center justify-center transition-all',
                      isSelected ? 'bg-primary border-primary text-white' : 'border-line bg-white'
                    )}
                  >
                    {isSelected && <Check size={14} />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
