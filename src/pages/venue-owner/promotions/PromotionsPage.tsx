import { Lock, Plus } from 'lucide-react';
import { Button, Tabs, Input, Select } from 'antd';
import { PageHeader, Panel } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { useState, useMemo } from 'react';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { toast } from 'sonner';

// Modular features
import { AdModal } from '@/features/promotions/components/AdModal';
import { AdViewModal } from '@/features/promotions/components/AdViewModal';
import { AdListItem } from '@/features/promotions/components/AdListItem';
import { PromotionsStats } from '@/features/promotions/components/PromotionsStats';
import { INITIAL_ADS, type Ad } from '@/features/promotions/types';

type SortBy = 'clicks' | 'views' | 'newest';

export default function PromotionsPage() {
  const tier = useAuthStore((s) => s.user?.tier);
  const unlocked = tier === 'tier_2' || tier === 'tier_3' || tier === 'tier_3_plus';

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

  const [ads, setAds] = useState<Ad[]>(INITIAL_ADS);
  const [tabKey, setTabKey] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  // Modal states
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingAd, setViewingAd] = useState<Ad | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);

  const filtered = useMemo(() => {
    let result = ads;

    // Tab filter
    if (tabKey === 'active') result = result.filter((a) => a.active);
    if (tabKey === 'inactive') result = result.filter((a) => !a.active);

    // Search filter
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.redirectUrl.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'clicks') result = [...result].sort((a, b) => b.clicks - a.clicks);
    if (sortBy === 'views') result = [...result].sort((a, b) => b.views - a.views);
    if (sortBy === 'newest') result = [...result].sort((a, b) => b.startDate.localeCompare(a.startDate));

    return result;
  }, [ads, tabKey, search, sortBy]);

  function openAdd() {
    setEditingAd(null);
    setAdModalOpen(true);
  }

  function openEdit(ad: Ad) {
    setEditingAd(ad);
    setAdModalOpen(true);
  }

  function openView(ad: Ad) {
    setViewingAd(ad);
    setViewModalOpen(true);
  }

  function openDelete(ad: Ad) {
    setAdToDelete(ad);
    setConfirmDeleteOpen(true);
  }

  function handleToggleActive(ad: Ad) {
    setAds((prev) =>
      prev.map((a) => (a.id === ad.id ? { ...a, active: !a.active } : a))
    );
    toast.success(ad.active ? `"${ad.title}" deactivated.` : `"${ad.title}" activated.`);
  }

  function handleSaveAd(_formData: FormData, values: Partial<Ad>) {
    if (editingAd) {
      setAds((prev) =>
        prev.map((a) => (a.id === editingAd.id ? { ...a, ...values } as Ad : a))
      );
      toast.success('Ad updated.');
    } else {
      const newAd: Ad = {
        id: `ad_${Math.random().toString(36).substr(2, 9)}`,
        title: values.title || 'New Ad',
        imageUrl: values.imageUrl,
        redirectUrl: values.redirectUrl || '',
        startDate: values.startDate || new Date().toISOString().split('T')[0],
        endDate: values.endDate || new Date().toISOString().split('T')[0],
        active: values.active ?? true,
        impressions: 0,
        clicks: 0,
        views: 0,
        revenue: 0,
      };
      setAds((prev) => [newAd, ...prev]);
      toast.success('Ad created.');
    }
    setAdModalOpen(false);
  }

  function handleConfirmDelete() {
    if (!adToDelete) return;
    setAds((prev) => prev.filter((a) => a.id !== adToDelete.id));
    toast.success(`"${adToDelete.title}" deleted.`);
    setConfirmDeleteOpen(false);
  }

  const activeCount = ads.filter((a) => a.active).length;
  const inactiveCount = ads.filter((a) => !a.active).length;

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

      <PromotionsStats ads={ads} />

      <Panel padded={false}>
        {/* Toolbar: tabs + search + sort */}
        <div className="px-5 pt-4 border-b border-line bg-surface-raised rounded-t-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            {/* Search + Sort */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input.Search
                placeholder="Search ads…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSearch={(v) => setSearch(v)}
                allowClear
                className="flex-1"
              />
              <Select<SortBy>
                value={sortBy}
                onChange={setSortBy}
                className="w-36 shrink-0"
                options={[
                  { label: 'Newest first', value: 'newest' },
                  { label: 'Most clicks', value: 'clicks' },
                  { label: 'Most views', value: 'views' },
                ]}
              />
            </div>
          </div>

          <Tabs
            activeKey={tabKey}
            onChange={(k) => setTabKey(k as typeof tabKey)}
            className="mb-[-1px]"
            items={[
              { key: 'all', label: `All ads (${ads.length})` },
              { key: 'active', label: `Active (${activeCount})` },
              { key: 'inactive', label: `Inactive (${inactiveCount})` },
            ]}
          />
        </div>

        {filtered.length > 0 ? (
          <ul className="divide-y divide-line">
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
              {search ? `No ads matching "${search}".` : 'No ads in this category.'}
            </div>
          </div>
        )}
      </Panel>

      {/* Create / Edit Modal */}
      <AdModal
        open={adModalOpen}
        ad={editingAd}
        onCancel={() => setAdModalOpen(false)}
        onSave={handleSaveAd}
      />

      {/* View Details Modal */}
      <AdViewModal
        open={viewModalOpen}
        ad={viewingAd}
        onClose={() => setViewModalOpen(false)}
        onEdit={(ad) => {
          setViewModalOpen(false);
          openEdit(ad);
        }}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete ad?"
        description={`"${adToDelete?.title}" will be permanently removed and can't be recovered.`}
        confirmText="Delete ad"
      />
    </>
  );
}
