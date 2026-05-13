import { Check, ArrowUpRight, Sparkles, Layers, PackagePlus } from 'lucide-react';
import { Button, Modal, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { PageHeader, Panel, SectionTitle, StatusBadge } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { TIER_META, TIER_LIST } from '@/constants/tiers';
import { INITIAL_ADDONS, type AddOn } from '@/constants/addons';
import { mockSubscriptions } from '@/constants/mock-data';
import { formatPence, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { UpgradeTierModal } from '@/components/subscription/UpgradeTierModal';
import { AddOnCard } from '@/components/subscription/AddOnCard';
import { AddOnPurchaseModal } from '@/components/subscription/AddOnPurchaseModal';
import { getEffectiveModules, isAddOnAvailable } from '@/lib/access';
import { toast } from 'sonner';
import type { VenueTier } from '@/types/auth';

const MODULE_NAMES = [
  '1 · Foundation',
  '2 · Programme content',
  '3 · Engagement',
  '4 · Audience response',
  '5 · Purchasing & gifting',
  '6 · Memory & keepsake',
  '7 · Sponsor & advertising',
  '8 · Recommendations',
  '9 · Push notifications',
  '10 · Getting there',
];

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const tier = user?.tier ?? 'tier_3';
  const meta = TIER_META[tier];
  const sub = mockSubscriptions.find((s) => s.owner_id === user?.id) ?? mockSubscriptions[0];
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<VenueTier | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  // Add-on state
  const allAddOns = INITIAL_ADDONS;
  const [activeAddOnIds, setActiveAddOnIds] = useState<string[]>([]);
  const [addOnModalOpen, setAddOnModalOpen] = useState(false);
  const [addOnModalMode, setAddOnModalMode] = useState<'purchase' | 'cancel'>('purchase');
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null);
  const [addOnLoading, setAddOnLoading] = useState(false);

  const activeAddOns = useMemo(
    () => allAddOns.filter((a) => activeAddOnIds.includes(a.id)),
    [allAddOns, activeAddOnIds]
  );
  const visibleAddOns = useMemo(
    () => allAddOns.filter((a) => isAddOnAvailable(a, tier) || a.status === 'coming_soon'),
    [allAddOns, tier]
  );
  const effectiveModules = useMemo(
    () => getEffectiveModules(tier, activeAddOns),
    [tier, activeAddOns]
  );
  const totalAddOnsCost = activeAddOns.reduce((sum, a) => sum + a.priceMonthly, 0);

  function openAddOnPurchase(addon: AddOn) {
    setSelectedAddOn(addon);
    setAddOnModalMode('purchase');
    setAddOnModalOpen(true);
  }
  function openAddOnCancel(addon: AddOn) {
    setSelectedAddOn(addon);
    setAddOnModalMode('cancel');
    setAddOnModalOpen(true);
  }
  function confirmAddOnAction(addon: AddOn) {
    setAddOnLoading(true);
    setTimeout(() => {
      if (addOnModalMode === 'purchase') {
        setActiveAddOnIds((ids) => Array.from(new Set([...ids, addon.id])));
        toast.success(`${addon.label} added to your plan.`);
      } else {
        setActiveAddOnIds((ids) => ids.filter((id) => id !== addon.id));
        toast.success(`${addon.label} removed. Active until next billing date.`);
      }
      setAddOnLoading(false);
      setAddOnModalOpen(false);
    }, 900);
  }
  function handleOpenUpgrade(target?: VenueTier) {
    if (target) {
      setSelectedTier(target);
    } else {
      // Find next tier
      const idx = TIER_LIST.indexOf(tier as VenueTier);
      const nextTier = TIER_LIST[idx + 1] ?? TIER_LIST[TIER_LIST.length - 1];
      if (nextTier === tier) {
        toast.info('You are already on the highest tier.');
        return;
      }
      setSelectedTier(nextTier);
    }
    setUpgradeModalOpen(true);
  }

  function handleConfirmUpgrade(t: VenueTier) {
    setUpgrading(true);
    // Simulate API call
    setTimeout(() => {
      setUpgrading(false);
      setUpgradeModalOpen(false);
      toast.success(`Welcome to the ${TIER_META[t].label} tier!`);
    }, 1500);
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Subscription"
        description="Your tier defines the modules unlocked in the programme builder. Tier scope applies to all your venues."
      />

      {/* Current subscription */}
      <Panel variant="deep" className="mb-7" padded>
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="min-w-0">
            <div className="eyebrow !text-accent-300 mb-2">Current plan</div>
            <h2 className="font-display font-extrabold text-3xl text-ink-inverse leading-tight">
              {meta.label}
            </h2>
            <p className="mt-2 text-ink-inverse/75 max-w-md">{meta.description}</p>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <Field label="Billing">
                {sub.interval === 'annual' ? 'Annual' : 'Monthly'} · {formatPence(sub.amount_pence)}
                {activeAddOns.length > 0 && (
                  <span className="text-ink-inverse/60 font-normal"> + {formatPence(totalAddOnsCost * 100)} add-ons</span>
                )}
              </Field>
              <Field label="Renews">{formatDate(sub.next_billing_at)}</Field>
              <Field label="Modules">
                {effectiveModules.size} of 10
                {effectiveModules.size > meta.modules.length && (
                  <span className="text-accent-300 font-normal"> (+{effectiveModules.size - meta.modules.length} via add-ons)</span>
                )}
              </Field>
              <Field label="Status">
                <StatusBadge status={sub.status} />
              </Field>
            </div>

            {activeAddOns.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <div className="eyebrow !text-accent-300 mb-2.5">Active add-ons</div>
                <div className="flex flex-wrap gap-2">
                  {activeAddOns.map((a) => (
                    <Tooltip key={a.id} title={`${a.label} · £${a.priceMonthly}/mo`}>
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11.5px] font-bold backdrop-blur-md"
                        style={{
                          backgroundColor: `${a.color}25`,
                          color: '#fff',
                          border: `1px solid ${a.color}55`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                        {a.label}
                      </span>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2.5 shrink-0">
            <Button
              type="primary"
              icon={<ArrowUpRight size={14} />}
              iconPosition="end"
              onClick={() => handleOpenUpgrade()}
            >
              Upgrade tier
            </Button>
            <Button
              ghost
              style={{ color: '#F9F8F4', borderColor: 'rgba(255,255,255,0.25)' }}
              onClick={() => setConfirmCancel(true)}
            >
              Cancel subscription
            </Button>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Modules unlocked */}
        <Panel className="lg:col-span-2" title="Modules unlocked" description="What your tier includes in the programme workshop.">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MODULE_NAMES.map((name, i) => {
              const moduleNum = i + 1;
              const fromTier = meta.modules.includes(moduleNum);
              const fromAddOn = !fromTier && effectiveModules.has(moduleNum);
              const ok = fromTier || fromAddOn;
              return (
                <li
                  key={name}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-colors',
                    fromTier && 'bg-primary/5 border-primary/20',
                    fromAddOn && 'bg-warning/5 border-warning/30',
                    !ok && 'bg-surface-sunken border-line opacity-60'
                  )}
                >
                  <span
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                      fromTier && 'bg-primary text-ink-inverse',
                      fromAddOn && 'bg-warning text-ink-inverse',
                      !ok && 'bg-surface-offset text-ink-faint'
                    )}
                  >
                    {ok ? <Check size={13} /> : <Layers size={12} />}
                  </span>
                  <span className={cn('text-sm font-medium flex-1 min-w-0', ok ? 'text-ink' : 'text-ink-faint')}>
                    Module {name}
                  </span>
                  {fromAddOn && (
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-warning shrink-0">
                      Add-on
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Billing history */}
        <Panel title="Billing history">
          <ul className="divide-y divide-line -m-1">
            {Array.from({ length: 4 }).map((_, i) => {
              const date = new Date(2026, 4 - i, 12);
              return (
                <li key={i} className="flex items-center justify-between px-2 py-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{formatDate(date.toISOString())}</div>
                    <div className="text-[12.5px] text-ink-muted">Invoice · {meta.short}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold tabular text-ink">
                      {formatPence(sub.amount_pence / (sub.interval === 'annual' ? 12 : 1))}
                    </div>
                    <Button type="link" style={{ padding: 0, height: 'auto', fontSize: 12 }}>
                      Download
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* Optional Extras / Add-Ons */}
      <SectionTitle
        className="mt-9"
        title="Optional Extras"
        description="À la carte upgrades you can add or remove on top of any tier."
        action={
          activeAddOns.length > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-[11.5px] font-bold text-primary">
              <PackagePlus size={12} />
              {activeAddOns.length} active · {formatPence(totalAddOnsCost * 100)}/mo
            </div>
          ) : undefined
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-9">
        {visibleAddOns.map((addon) => (
          <AddOnCard
            key={addon.id}
            addon={addon}
            tier={tier}
            isActive={activeAddOnIds.includes(addon.id)}
            onAdd={() => openAddOnPurchase(addon)}
            onRemove={() => openAddOnCancel(addon)}
          />
        ))}
      </div>

      {/* Compare tiers */}
      <SectionTitle className="mt-9" title="Compare tiers" description="Pick the plan that suits your venue." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {TIER_LIST.map((t) => {
          const m = TIER_META[t];
          const isCurrent = t === tier;
          return (
            <div
              key={t}
              className={cn(
                'relative rounded-2xl border bg-surface-raised p-4 transition-all',
                isCurrent ? 'border-primary/40 shadow-medium z-10' : 'border-line hover:shadow-soft'
              )}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 right-4 chip chip-primary !text-[10px] z-50 backdrop-blur-md ">Current</span>
              )}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${m.color}18`, color: m.color }}
              >
                <Sparkles size={16} />
              </div>
              <div className="font-display font-bold text-ink">{m.label}</div>
              <div className="text-[11.5px] text-ink-faint mt-1 mb-3">{m.audience}</div>
              <ul className="space-y-1 text-[12.5px] text-ink-muted mb-4">
                <li>· {m.modules.length} modules</li>
                <li>· {m.can_charge ? 'Can charge for programmes' : 'Programmes free'}</li>
              </ul>
              <Button 
                block 
                disabled={isCurrent}
                onClick={() => handleOpenUpgrade(t as VenueTier)}
              >
                {isCurrent ? 'Current plan' : 'Switch'}
              </Button>
            </div>
          );
        })}
      </div>

      <Modal
        open={confirmCancel}
        onCancel={() => setConfirmCancel(false)}
        title="Cancel subscription?"
        centered
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setConfirmCancel(false)}>Keep my plan</Button>
            <Button danger type="primary">
              Cancel subscription
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted">
          Your plan will remain active until <strong className="text-ink">{formatDate(sub.next_billing_at)}</strong>.
          After that, your venues drop to the free Tier 1 — programmes will remain published but advanced
          modules will be locked. You can resubscribe at any time.
        </p>
      </Modal>

      <UpgradeTierModal
        open={upgradeModalOpen}
        tierKey={selectedTier}
        onCancel={() => setUpgradeModalOpen(false)}
        onConfirm={handleConfirmUpgrade}
        loading={upgrading}
      />

      <AddOnPurchaseModal
        open={addOnModalOpen}
        addon={selectedAddOn}
        mode={addOnModalMode}
        onCancel={() => setAddOnModalOpen(false)}
        onConfirm={confirmAddOnAction}
        loading={addOnLoading}
      />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-accent-300 font-bold">{label}</div>
      <div className="text-sm font-semibold text-ink-inverse mt-1">{children}</div>
    </div>
  );
}
