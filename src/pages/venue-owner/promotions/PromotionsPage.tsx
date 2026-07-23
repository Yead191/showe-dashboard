import { Lock, Plus } from 'lucide-react';
import { Button, Tabs, Input, Spin } from 'antd';
import { PageHeader, Panel } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { toast } from 'sonner';
import {
  mapApiAdToAd,
  useDeleteOrganizationAdMutation,
  useGetOrganizationAdQuery,
  useGetOrganizationAdsAnalyticsQuery,
  useGetOrganizationAdsQuery,
  useUpdateOrganizationAdMutation,
} from '@/store/api/organizationApi/adsApi';

import { AdModal } from '@/features/promotions/components/AdModal';
import { AdViewModal } from '@/features/promotions/components/AdViewModal';
import { AdListItem } from '@/features/promotions/components/AdListItem';
import { PromotionsStats } from '@/features/promotions/components/PromotionsStats';
import type { Ad } from '@/features/promotions/types';
import { getApiErrorMessage } from '@/lib/api-error';

type SortBy = 'clicks' | 'views' | 'newest';
type AdsTab = 'all' | 'active' | 'inactive';

const SEARCH_DEBOUNCE_MS = 300;

function isAdsTab(value: string | null): value is AdsTab {
  return value === 'all' || value === 'active' || value === 'inactive';
}

function tabToStatus(tab: AdsTab): string | undefined {
  return tab === 'all' ? undefined : tab;
}

export default function PromotionsPage() {
  const tier = useAuthStore((s) => s.user?.tier);
  const unlocked = tier === 'tier_2' || tier === 'tier_3' || tier === 'tier_3_plus';

  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';
  const tabFromUrl = searchParams.get('tabs');
  const tab: AdsTab = isAdsTab(tabFromUrl) ? tabFromUrl : 'all';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [sortBy] = useState<SortBy>('newest');

  const [adModalOpen, setAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingAdId, setViewingAdId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);

  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    if (isAdsTab(tabFromUrl)) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tabs', 'all');
        return next;
      },
      { replace: true }
    );
  }, [tabFromUrl, setSearchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      setDebouncedSearch(trimmed);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set('search', trimmed);
          else next.delete('search');
          if (!isAdsTab(next.get('tabs'))) {
            next.set('tabs', tab);
          }
          return next;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams, tab]);

  const { data: adsData, isLoading: isAdsLoading, isError, isFetching } = useGetOrganizationAdsQuery(
    {
      page: 1,
      limit: 50,
      searchTerm: debouncedSearch || undefined,
      status: tabToStatus(tab),
    },
    { skip: !unlocked }
  );
  const { data: analytics, isLoading: isAnalyticsLoading } = useGetOrganizationAdsAnalyticsQuery(
    undefined,
    { skip: !unlocked }
  );
  const [updateAd] = useUpdateOrganizationAdMutation();
  const [deleteAd, { isLoading: isDeleting }] = useDeleteOrganizationAdMutation();

  const { data: viewingApiAd, isFetching: isViewLoading } = useGetOrganizationAdQuery(
    viewingAdId ?? '',
    { skip: !viewingAdId || !viewModalOpen }
  );

  const ads = useMemo(
    () => (adsData?.ads ?? []).map(mapApiAdToAd),
    [adsData?.ads]
  );

  const viewingAd = useMemo(() => {
    if (viewingApiAd) return mapApiAdToAd(viewingApiAd);
    return ads.find((a) => a.id === viewingAdId) ?? null;
  }, [viewingApiAd, ads, viewingAdId]);

  const filtered = useMemo(() => {
    let result = ads;

    if (sortBy === 'clicks') result = [...result].sort((a, b) => b.clicks - a.clicks);
    if (sortBy === 'views') result = [...result].sort((a, b) => b.views - a.views);
    if (sortBy === 'newest') result = [...result].sort((a, b) => b.startDate.localeCompare(a.startDate));

    return result;
  }, [ads, sortBy]);

  function setTab(nextTab: AdsTab) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tabs', nextTab);
        const trimmed = searchInput.trim();
        if (trimmed) next.set('search', trimmed);
        else next.delete('search');
        return next;
      },
      { replace: true }
    );
  }

  if (!unlocked) {
    return (
      <>
        <PageHeader
          eyebrow="Promotions"
          title="Sponsor & advertising"
          description="Sell sponsor slots inside your programmes."
        />
        <Panel padded>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-[#8A5C00] flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <div className="eyebrow mb-2">Tier 2 Engage</div>
              <h2 className="font-display font-extrabold text-2xl text-ink">
                Promotions are unlocked from Tier 2 onwards.
              </h2>
              <p className="mt-2 text-ink-muted max-w-xl">
                Sell sponsor placements inside your programmes (Module 7). You're on{' '}
                <span className="font-semibold text-ink">
                  {tier ? TIER_META[tier].label : 'a starter tier'}
                </span>.
              </p>
              <div className="mt-5 flex gap-2">
                <Button type="primary">Upgrade tier</Button>
              </div>
            </div>
          </div>
        </Panel>
      </>
    );
  }

  function openAdd() {
    setEditingAd(null);
    setAdModalOpen(true);
  }

  function openEdit(ad: Ad) {
    setEditingAd(ad);
    setAdModalOpen(true);
  }

  function openView(ad: Ad) {
    setViewingAdId(ad.id);
    setViewModalOpen(true);
  }

  function openDelete(ad: Ad) {
    setAdToDelete(ad);
    setConfirmDeleteOpen(true);
  }

  async function handleToggleActive(ad: Ad) {
    try {
      await updateAd({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        redirectUrl: ad.redirectUrl,
        startDate: ad.startDate,
        endDate: ad.endDate,
        active: !ad.active,
      }).unwrap();
      toast.success(ad.active ? `"${ad.title}" deactivated.` : `"${ad.title}" activated.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update ad status.'));
    }
  }

  async function handleConfirmDelete() {
    if (!adToDelete) return;
    try {
      const result = await deleteAd(adToDelete.id).unwrap();
      toast.success(result.message || `"${adToDelete.title}" deleted.`);
      setConfirmDeleteOpen(false);
      setAdToDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete ad.'));
    }
  }

  const totalCount = adsData?.pagination?.total ?? ads.length;

  return (
    <>
      <PageHeader
        eyebrow="Promotions"
        title="Ads & advertising"
        description="Manage ad campaigns inside your programmes (Module 7)."
        actions={
          <Button type="primary" icon={<Plus size={14} />} onClick={openAdd}>
            New ad
          </Button>
        }
      />

      <PromotionsStats
        ads={ads}
        analytics={analytics}
        isLoading={isAnalyticsLoading || isAdsLoading}
      />

      <Panel padded={false}>
        <div className="px-5 pt-4 border-b border-line bg-surface-raised rounded-t-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                placeholder="Search ads…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                allowClear
                className="flex-1"
              />
            </div>
          </div>

          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as AdsTab)}
            className="mb-[-1px]"
            items={[
              {
                key: 'all',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    All ads
                    {tab === 'all' && (
                      <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                        {totalCount}
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: 'active',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    Active
                    {tab === 'active' && (
                      <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                        {totalCount}
                      </span>
                    )}
                  </span>
                ),
              },
              {
                key: 'inactive',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    Inactive
                    {tab === 'inactive' && (
                      <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                        {totalCount}
                      </span>
                    )}
                  </span>
                ),
              },
            ]}
          />
        </div>

        {isAdsLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : isError ? (
          <div className="py-14 text-center text-sm text-ink-muted">
            Couldn’t load ads. Please try again.
          </div>
        ) : filtered.length > 0 ? (
          <ul className={`divide-y divide-line ${isFetching ? 'opacity-70' : ''}`}>
            {filtered.map((ad) => (
              <AdListItem
                key={ad.id}
                ad={ad}
                onView={openView}
                onEdit={openEdit}
                onToggleActive={handleToggleActive}
                onDelete={openDelete}
              />
            ))}
          </ul>
        ) : (
          <div className="py-14 text-center">
            <div className="text-ink-faint text-sm">
              {debouncedSearch ? `No ads matching "${debouncedSearch}".` : 'No ads in this category.'}
            </div>
          </div>
        )}
      </Panel>

      <AdModal
        open={adModalOpen}
        ad={editingAd}
        onCancel={() => setAdModalOpen(false)}
      />

      <AdViewModal
        open={viewModalOpen}
        ad={viewingAd}
        isLoading={isViewLoading && !viewingAd}
        onClose={() => {
          setViewModalOpen(false);
          setViewingAdId(null);
        }}
        onEdit={(ad) => {
          setViewModalOpen(false);
          setViewingAdId(null);
          openEdit(ad);
        }}
      />

      <DeleteConfirmModal
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        title="Delete ad?"
        description={`"${adToDelete?.title}" will be permanently removed and can't be recovered.`}
        confirmText="Delete ad"
      />
    </>
  );
}
