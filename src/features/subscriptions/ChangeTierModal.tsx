import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Spin } from 'antd';
import { Check, Sparkles, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { cn, formatGBP } from '@/lib/utils';
import type { ApiSubscribedUser } from '@/store/api/subscribedUserApi';
import type { ApiSubscriptionPackage } from '@/store/api/subscriptionPackageApi';

interface ChangeTierModalProps {
  open: boolean;
  subscription: ApiSubscribedUser | null;
  packages: ApiSubscriptionPackage[];
  packagesLoading?: boolean;
  confirmLoading?: boolean;
  onClose: () => void;
  onConfirm: (userId: string, packageId: string) => void;
}

export function ChangeTierModal({
  open,
  subscription,
  packages,
  packagesLoading = false,
  confirmLoading = false,
  onClose,
  onConfirm,
}: ChangeTierModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const currentPackageId = subscription?.package?._id ?? null;

  const sortedPackages = useMemo(
    () => [...packages].sort((a, b) => a.priceMonthly - b.priceMonthly),
    [packages],
  );

  const currentPackage = useMemo(
    () => sortedPackages.find((pkg) => pkg._id === currentPackageId) ?? null,
    [sortedPackages, currentPackageId],
  );

  const selectedPackage = useMemo(
    () => sortedPackages.find((pkg) => pkg._id === selectedPackageId) ?? null,
    [sortedPackages, selectedPackageId],
  );

  useEffect(() => {
    if (open && subscription) {
      setSelectedPackageId(subscription.package?._id ?? null);
    }
  }, [open, subscription]);

  if (!subscription) return null;

  const currentPrice = currentPackage?.priceMonthly ?? subscription.price ?? 0;
  const selectedPrice = selectedPackage?.priceMonthly ?? currentPrice;
  const priceDelta = selectedPrice - currentPrice;

  const isSameTier =
    !!selectedPackageId &&
    !!currentPackageId &&
    selectedPackageId === currentPackageId;

  const direction = isSameTier
    ? 'same'
    : selectedPrice > currentPrice
      ? 'upgrade'
      : selectedPrice < currentPrice
        ? 'downgrade'
        : 'same';

  const directionMeta = {
    upgrade: { label: 'Upgrade', icon: ArrowUp, color: 'text-success' },
    downgrade: { label: 'Downgrade', icon: ArrowDown, color: 'text-accent' },
    same: { label: 'Current plan', icon: Minus, color: 'text-ink-faint' },
  }[direction];

  const DirIcon = directionMeta.icon;

  function handleConfirm() {
    if (!subscription || !selectedPackageId || isSameTier) return;
    onConfirm(subscription.user._id, selectedPackageId);
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Change subscription tier"
      width={760}
      centered
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12.5px] text-ink-muted">
            {isSameTier || !selectedPackage ? (
              <>Choose a different tier to continue.</>
            ) : (
              <>
                Price change:{' '}
                <span
                  className={cn(
                    'font-display font-bold',
                    priceDelta > 0 ? 'text-success' : 'text-accent',
                  )}
                >
                  {priceDelta > 0 ? '+' : ''}
                  {formatGBP(priceDelta)} / mo
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} disabled={confirmLoading}>
              Cancel
            </Button>
            <Button
              type="primary"
              disabled={isSameTier || !selectedPackageId}
              danger={direction === 'downgrade'}
              onClick={handleConfirm}
              loading={confirmLoading}
              icon={<DirIcon size={14} />}
            >
              {isSameTier ? 'Same tier' : `Confirm ${directionMeta.label.toLowerCase()}`}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-sunken border border-line">
        <Avatar
          src={subscription.user.image}
          name={subscription.user.name}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink truncate">{subscription.user.name}</div>
          <div className="text-[12.5px] text-ink-faint truncate">{subscription.user.email}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider font-bold text-ink-faint">
            Currently on
          </div>
          <div className="font-display font-bold text-ink">
            {currentPackage?.label ?? subscription.name}
          </div>
        </div>
      </div>

      {packagesLoading ? (
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1 -mr-1 py-5 mt-2">
          {sortedPackages.map((pkg) => {
            const isCurrent = pkg._id === currentPackageId;
            const isSelected = selectedPackageId === pkg._id;
            const dirFromCurrent =
              pkg.priceMonthly > currentPrice
                ? 'upgrade'
                : pkg.priceMonthly < currentPrice
                  ? 'downgrade'
                  : 'same';

            return (
              <button
                key={pkg._id}
                type="button"
                onClick={() => setSelectedPackageId(pkg._id)}
                className={cn(
                  'relative text-left rounded-2xl border p-4 transition-all bg-surface-raised',
                  isSelected
                    ? 'border-primary shadow-medium ring-2 ring-primary/15'
                    : 'border-line hover:border-line-strong hover:shadow-soft',
                )}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 right-3 chip chip-primary !text-[10px] z-10 backdrop-blur-lg">
                    Current
                  </span>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${pkg.color}18`, color: pkg.color }}
                  >
                    <Sparkles size={18} />
                  </div>
                  {isSelected && !isCurrent && (
                    <span className="w-6 h-6 rounded-full bg-primary text-ink-inverse flex items-center justify-center">
                      <Check size={13} />
                    </span>
                  )}
                </div>

                <div className="font-display font-bold text-ink">{pkg.label}</div>
                <div className="text-[11.5px] text-ink-faint mt-0.5 mb-3 line-clamp-1">
                  {pkg.audience}
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="font-display font-extrabold text-xl text-ink">
                    {formatGBP(pkg.priceMonthly)}
                  </span>
                  <span className="text-[11px] text-ink-faint">/ mo</span>
                </div>

                <ul className="space-y-1 text-[12.5px] text-ink-muted">
                  <li>{pkg.modules.length} of 10 modules</li>
                  <li>
                    {pkg.can_charge || pkg.is_proggramme_sell
                      ? 'Can charge for programmes'
                      : 'Free programmes only'}
                  </li>
                </ul>

                {!isCurrent && dirFromCurrent !== 'same' && (
                  <div
                    className={cn(
                      'mt-3 pt-3 border-t border-line text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1',
                      dirFromCurrent === 'upgrade' ? 'text-success' : 'text-accent',
                    )}
                  >
                    {dirFromCurrent === 'upgrade' ? (
                      <ArrowUp size={11} />
                    ) : (
                      <ArrowDown size={11} />
                    )}
                    {dirFromCurrent === 'upgrade' ? 'Upgrade' : 'Downgrade'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
