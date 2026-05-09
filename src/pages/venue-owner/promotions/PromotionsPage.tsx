import { Lock, Plus } from 'lucide-react';
import { Button, Tabs } from 'antd';
import { PageHeader, Panel } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META } from '@/constants/tiers';
import { useState, useMemo } from 'react';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { toast } from 'sonner';

// Modular features
import { SponsorModal } from '@/features/promotions/components/SponsorModal';
import { SponsorListItem } from '@/features/promotions/components/SponsorListItem';
import { PromotionsStats } from '@/features/promotions/components/PromotionsStats';
import { INITIAL_SPONSORS, type Sponsor } from '@/features/promotions/types';

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
                Sell sponsor placements inside your programmes (Module 7). You’re on{' '}
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

  const [sponsors, setSponsors] = useState<Sponsor[]>(INITIAL_SPONSORS);
  const [tabKey, setTabKey] = useState('all');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [confirmPauseOpen, setConfirmPauseOpen] = useState(false);
  const [sponsorToPause, setSponsorToPause] = useState<Sponsor | null>(null);

  const filtered = useMemo(() => {
    if (tabKey === 'all') return sponsors;
    return sponsors.filter((s) => s.status === tabKey);
  }, [sponsors, tabKey]);

  function openAdd() {
    setEditingSponsor(null);
    setModalOpen(true);
  }

  function openEdit(s: Sponsor) {
    setEditingSponsor(s);
    setModalOpen(true);
  }

  function openPause(s: Sponsor) {
    setSponsorToPause(s);
    setConfirmPauseOpen(true);
  }

  function handleSaveSponsor(values: Partial<Sponsor>) {
    if (editingSponsor) {
      setSponsors(sponsors.map((s) => (s.id === editingSponsor.id ? { ...s, ...values } as Sponsor : s)));
      toast.success('Campaign updated.');
    } else {
      const newSponsor: Sponsor = {
        id: `spo_${Math.random().toString(36).substr(2, 9)}`,
        name: values.name || 'New Sponsor',
        slot: values.slot || 'Custom Slot',
        impressions: 0,
        clicks: 0,
        revenue: values.revenue || 0,
        status: values.status || 'pending',
      };
      setSponsors([newSponsor, ...sponsors]);
      toast.success('Sponsor slot created.');
    }
    setModalOpen(false);
  }

  function handleConfirmPause() {
    if (!sponsorToPause) return;
    const isPausing = sponsorToPause.status === 'active';
    setSponsors(
      sponsors.map((s) =>
        s.id === sponsorToPause.id ? { ...s, status: isPausing ? 'suspended' : 'active' } : s
      )
    );
    toast.success(isPausing ? 'Sponsor paused.' : 'Sponsor resumed.');
    setConfirmPauseOpen(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="Promotions"
        title="Sponsor & advertising"
        description="Manage sponsor slots inside your programmes (Module 7)."
        actions={
          <Button type="primary" icon={<Plus size={14} />} onClick={openAdd}>
            New sponsor slot
          </Button>
        }
      />

      <PromotionsStats sponsors={sponsors} />

      <Panel padded={false}>
        <div className="px-5 pt-4 border-b border-line bg-surface-raised rounded-t-2xl">
          <Tabs
            activeKey={tabKey}
            onChange={setTabKey}
            className="mb-[-1px]"
            items={[
              { key: 'all', label: `All slots (${sponsors.length})` },
              { key: 'active', label: 'Active' },
              { key: 'pending', label: 'Pending' },
              { key: 'suspended', label: 'Paused' },
            ]}
          />
        </div>
        
        {filtered.length > 0 ? (
          <ul className="divide-y divide-line">
            {filtered.map((s) => (
              <SponsorListItem 
                key={s.id} 
                sponsor={s} 
                onEdit={openEdit} 
                onPause={openPause} 
              />
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
             <div className="text-ink-faint text-sm">No sponsors found in this category.</div>
          </div>
        )}
      </Panel>

      {/* Add/Edit Modal */}
      <SponsorModal
        open={modalOpen}
        sponsor={editingSponsor}
        onCancel={() => setModalOpen(false)}
        onSave={handleSaveSponsor}
      />

      {/* Pause Confirmation */}
      <DeleteConfirmModal
        open={confirmPauseOpen}
        onCancel={() => setConfirmPauseOpen(false)}
        onConfirm={handleConfirmPause}
        title={sponsorToPause?.status === 'active' ? 'Pause sponsor slot?' : 'Resume sponsor slot?'}
        description={
          sponsorToPause?.status === 'active'
            ? `The slot for “${sponsorToPause?.name}” will be hidden from programmes until resumed.`
            : `The slot for “${sponsorToPause?.name}” will be visible in programmes again.`
        }
        confirmText={sponsorToPause?.status === 'active' ? 'Pause slot' : 'Resume slot'}
      />
    </>
  );
}
