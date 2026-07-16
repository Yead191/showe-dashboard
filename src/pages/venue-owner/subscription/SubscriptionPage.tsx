import { Check, ArrowUpRight, Sparkles, Layers, PackagePlus } from 'lucide-react';
import { Button, Modal, Spin, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { PageHeader, Panel, SectionTitle, StatusBadge, EmptyState } from '@/components/ui';
import { formatPence, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { UpgradeTierModal } from '@/components/subscription/UpgradeTierModal';
import { AddOnCard } from '@/components/subscription/AddOnCard';
import { AddOnPurchaseModal } from '@/components/subscription/AddOnPurchaseModal';
import { isAddOnAvailable } from '@/lib/access';
import { toast } from 'sonner';
import type { AddOn, AddOnAvailability, CapabilityKey } from '@/constants/addons';
import type { VenueTier } from '@/types/auth';
import { TIER_META, TIER_LIST } from '@/constants/tiers';
import { useGetSubscriptionPackagesQuery, type ApiSubscriptionPackage } from '@/store/api/subscriptionPackageApi';
import { useGetAddOnsQuery, type ApiAddOn } from '@/store/api/addOnsApi';
import {
  useGetMySubscriptionQuery,
  useUpdateSubscriptionMutation,
  usePurchaseAddOnMutation,
  useCancelMySubscriptionMutation,
} from '@/store/api/organizationApi/subscriptionApi';
import { getApiErrorMessage } from '@/lib/api-error';
import type { ComponentProps } from 'react';

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

const SHORT_TO_TIER: Record<string, VenueTier> = {
  T1: 'tier_1',
  'T1+': 'tier_1_plus',
  T2: 'tier_2',
  T3: 'tier_3',
  'T3+': 'tier_3_plus',
};

function packageToTierKey(pkg: ApiSubscriptionPackage | null | undefined): VenueTier {
  if (!pkg) return 'tier_1';
  if (SHORT_TO_TIER[pkg.short]) return SHORT_TO_TIER[pkg.short];
  const byLabel = TIER_LIST.find((t) => TIER_META[t].label === pkg.label);
  return byLabel ?? 'tier_1';
}

function addOnToLocal(addon: ApiAddOn): AddOn {
  return {
    id: addon._id,
    label: addon.label,
    short: addon.short,
    description: addon.description,
    bullets: addon.bullets,
    price: addon.priceMonthly,
    color: addon.color,
    icon: addon.icon,
    linkedModule: addon.linkedModule,
    capabilityKey: addon.capabilityKey as CapabilityKey,
    status: addon.status,
    availableOn: (addon.availableOn === 'all' ? 'all' : addon.availableOn) as AddOnAvailability,
  };
}

function sortPackages(packages: ApiSubscriptionPackage[]) {
  return [...packages].sort((a, b) => a.priceMonthly - b.priceMonthly);
}

function extractCheckoutUrl(result: { data?: string }): string | null {
  const url = result.data?.trim();
  if (!url) return null;
  return url.startsWith('http://') || url.startsWith('https://') ? url : null;
}

export default function SubscriptionPage() {
  const { data: subscription, isLoading: subLoading, isError: subError } = useGetMySubscriptionQuery();
  const { data: packages = [], isLoading: packagesLoading } = useGetSubscriptionPackagesQuery();
  const { data: apiAddOns = [], isLoading: addOnsLoading } = useGetAddOnsQuery();

  const [updateSubscription, { isLoading: upgrading }] = useUpdateSubscriptionMutation();
  const [purchaseAddOn, { isLoading: purchasingAddOn }] = usePurchaseAddOnMutation();
  const [cancelSubscription, { isLoading: cancelling }] = useCancelMySubscriptionMutation();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ApiSubscriptionPackage | null>(null);
  const [addOnModalOpen, setAddOnModalOpen] = useState(false);
  const [addOnModalMode, setAddOnModalMode] = useState<'purchase' | 'cancel'>('purchase');
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null);

  const sortedPackages = useMemo(() => sortPackages(packages), [packages]);
  const currentPackage = useMemo(
    () => sortedPackages.find((p) => p._id === subscription?.package) ?? null,
    [sortedPackages, subscription?.package]
  );
  const tier = packageToTierKey(currentPackage);
  const allAddOns = useMemo(() => apiAddOns.map(addOnToLocal), [apiAddOns]);
  const activeAddOnIds = subscription?.addons ?? [];

  const activeAddOns = useMemo(
    () => allAddOns.filter((a) => activeAddOnIds.includes(a.id)),
    [allAddOns, activeAddOnIds]
  );
  const visibleAddOns = useMemo(
    () => allAddOns.filter((a) => isAddOnAvailable(a, tier) || a.status === 'coming_soon'),
    [allAddOns, tier]
  );
  const packageModules = useMemo(
    () => new Set(subscription?.modules?.length ? subscription.modules : (currentPackage?.modules ?? [])),
    [subscription?.modules, currentPackage?.modules]
  );
  const effectiveModules = useMemo(() => {
    const modules = new Set(packageModules);
    for (const addon of activeAddOns) {
      if (addon.linkedModule) modules.add(addon.linkedModule);
    }
    return modules;
  }, [packageModules, activeAddOns]);
  const totalAddOnsCost = activeAddOns.reduce((sum, a) => sum + a.price, 0);

  const planLabel = subscription?.name ?? currentPackage?.label ?? 'No plan';
  const planDescription = currentPackage?.description ?? 'Subscribe to unlock programme builder modules.';
  const planPricePence = (subscription?.price ?? currentPackage?.priceMonthly ?? 0) * 100;
  const renewsAt = subscription?.endDate;
  const status = (subscription?.status ?? 'pending') as ComponentProps<typeof StatusBadge>['status'];

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

  async function confirmAddOnAction(addon: AddOn) {
    if (addOnModalMode === 'cancel') {
      toast.info('Add-on removal will apply from your next billing date. Contact support if you need it sooner.');
      setAddOnModalOpen(false);
      return;
    }

    try {
      const result = await purchaseAddOn(addon.id).unwrap();
      toast.success(result.message || `${addon.label} added to your plan.`);
      setAddOnModalOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Failed to add ${addon.label}.`));
    }
  }

  function handleOpenUpgrade(targetPackage?: ApiSubscriptionPackage) {
    if (targetPackage) {
      if (targetPackage._id === currentPackage?._id) {
        toast.info('You are already on this plan.');
        return;
      }
      setSelectedPackage(targetPackage);
      setUpgradeModalOpen(true);
      return;
    }

    const currentIdx = currentPackage
      ? sortedPackages.findIndex((p) => p._id === currentPackage._id)
      : -1;
    const nextPackage = sortedPackages[currentIdx + 1] ?? sortedPackages[sortedPackages.length - 1];
    if (!nextPackage || nextPackage._id === currentPackage?._id) {
      toast.info('You are already on the highest tier.');
      return;
    }
    setSelectedPackage(nextPackage);
    setUpgradeModalOpen(true);
  }

  async function handleConfirmUpgrade(packageId: string) {
    try {
      const result = await updateSubscription({ receipt: packageId }).unwrap();
      const checkoutUrl = extractCheckoutUrl(result);
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      toast.success(result.message || 'Subscription updated successfully.');
      setUpgradeModalOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update subscription.'));
    }
  }

  async function handleCancelSubscription() {
    if (!subscription?._id) {
      toast.error('No active subscription to cancel.');
      return;
    }
    try {
      const result = await cancelSubscription(subscription._id).unwrap();
      toast.success(result.message || 'Subscription cancelled.');
      setConfirmCancel(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel subscription.'));
    }
  }

  const loading = subLoading || packagesLoading || addOnsLoading;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (subError) {
    return (
      <EmptyState
        title="Couldn’t load subscription"
        description="Something went wrong fetching your plan. Please try again."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Subscription"
        description="Your tier defines the modules unlocked in the programme builder. Tier scope applies to all your venues."
      />

      <Panel variant="deep" className="mb-7" padded>
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="min-w-0">
            <div className="eyebrow !text-accent-300 mb-2">Current plan</div>
            <h2 className="font-display font-extrabold text-3xl text-ink-inverse leading-tight">
              {planLabel}
            </h2>
            <p className="mt-2 text-ink-inverse/75 max-w-md">{planDescription}</p>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <Field label="Billing">
                Monthly · {formatPence(planPricePence)}
                {activeAddOns.length > 0 && (
                  <span className="text-ink-inverse/60 font-normal">
                    {' '}
                    + {formatPence(totalAddOnsCost * 100)} add-ons
                  </span>
                )}
              </Field>
              <Field label="Renews">{renewsAt ? formatDate(renewsAt) : '—'}</Field>
              <Field label="Modules">
                {effectiveModules.size} of 10
                {effectiveModules.size > packageModules.size && (
                  <span className="text-accent-300 font-normal">
                    {' '}
                    (+{effectiveModules.size - packageModules.size} via add-ons)
                  </span>
                )}
              </Field>
              <Field label="Status">
                <StatusBadge status={status} />
              </Field>
              {typeof subscription?.remainingDays === 'number' && (
                <Field label="Remaining">{subscription.remainingDays} days</Field>
              )}
            </div>

            {activeAddOns.length > 0 && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <div className="eyebrow !text-accent-300 mb-2.5">Active add-ons</div>
                <div className="flex flex-wrap gap-2">
                  {activeAddOns.map((a) => (
                    <Tooltip key={a.id} title={`${a.label} · £${a.price}/mo`}>
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
              disabled={!subscription?._id}
            >
              Cancel subscription
            </Button>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel
          className="lg:col-span-2"
          title="Modules unlocked"
          description="What your tier includes in the programme workshop."
        >
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MODULE_NAMES.map((name, i) => {
              const moduleNum = i + 1;
              const fromTier = packageModules.has(moduleNum);
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

        <Panel title="Plan details">
          <ul className="divide-y divide-line -m-1">
            <li className="flex items-center justify-between px-2 py-3">
              <div className="text-sm text-ink-muted">Started</div>
              <div className="text-sm font-semibold text-ink">
                {subscription?.startDate ? formatDate(subscription.startDate) : '—'}
              </div>
            </li>
            <li className="flex items-center justify-between px-2 py-3">
              <div className="text-sm text-ink-muted">Renews</div>
              <div className="text-sm font-semibold text-ink">
                {renewsAt ? formatDate(renewsAt) : '—'}
              </div>
            </li>
            <li className="flex items-center justify-between px-2 py-3">
              <div className="text-sm text-ink-muted">Transaction</div>
              <div className="text-sm font-semibold text-ink truncate max-w-[140px]" title={subscription?.txId}>
                {subscription?.txId ?? '—'}
              </div>
            </li>
            <li className="flex items-center justify-between px-2 py-3">
              <div className="text-sm text-ink-muted">Monthly total</div>
              <div className="font-display font-bold tabular text-ink">
                {formatPence(planPricePence + totalAddOnsCost * 100)}
              </div>
            </li>
          </ul>
        </Panel>
      </div>

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
        {visibleAddOns.length === 0 && (
          <EmptyState
            className="md:col-span-2 lg:col-span-3"
            title="No add-ons available"
            description="Optional extras for your plan will appear here when published."
          />
        )}
      </div>

      <SectionTitle className="mt-9" title="Compare tiers" description="Pick the plan that suits your venue." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {sortedPackages.map((pkg) => {
          const isCurrent = pkg._id === currentPackage?._id;
          return (
            <div
              key={pkg._id}
              className={cn(
                'relative rounded-2xl border bg-surface-raised p-4 transition-all',
                isCurrent ? 'border-primary/40 shadow-medium z-10' : 'border-line hover:shadow-soft'
              )}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 right-4 chip chip-primary !text-[10px] z-50 backdrop-blur-md ">
                  Current
                </span>
              )}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${pkg.color}18`, color: pkg.color }}
              >
                <Sparkles size={16} />
              </div>
              <div className="font-display font-bold text-ink">{pkg.label}</div>
              <div className="text-[11.5px] text-ink-faint mt-1 mb-1">{pkg.audience}</div>
              <div className="text-sm font-semibold text-ink mb-3">
                {formatPence(pkg.priceMonthly * 100)}
                <span className="text-ink-faint font-normal">/mo</span>
              </div>
              <ul className="space-y-1 text-[12.5px] text-ink-muted mb-4">
                <li>· {pkg.modules.length} modules</li>
                <li>· {pkg.can_charge || pkg.is_proggramme_sell ? 'Can charge for programmes' : 'Programmes free'}</li>
              </ul>
              <Button block disabled={isCurrent} onClick={() => handleOpenUpgrade(pkg)}>
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
            <Button danger type="primary" loading={cancelling} onClick={handleCancelSubscription}>
              Cancel subscription
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-muted">
          Your plan will remain active until{' '}
          <strong className="text-ink">{renewsAt ? formatDate(renewsAt) : 'the end of the billing period'}</strong>.
          After that, advanced modules will be locked. You can resubscribe at any time.
        </p>
      </Modal>

      <UpgradeTierModal
        open={upgradeModalOpen}
        packageItem={selectedPackage}
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
        loading={purchasingAddOn}
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
