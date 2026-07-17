import { Modal, Button } from 'antd';
import { Sparkles, Check, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { formatPence } from '@/lib/utils';
import type { ApiSubscriptionPackage } from '@/store/api/subscriptionPackageApi';

interface UpgradeTierModalProps {
  open: boolean;
  packageItem: ApiSubscriptionPackage | null;
  onCancel: () => void;
  onConfirm: (packageId: string) => void;
  loading?: boolean;
}

const MODULE_NAMES = [
  'Foundation',
  'Programme content',
  'Engagement',
  'Audience response',
  'Purchasing & gifting',
  'Memory & keepsake',
  'Sponsor & advertising',
  'Recommendations',
  'Push notifications',
  'Getting there',
];

export function UpgradeTierModal({
  open,
  packageItem,
  onCancel,
  onConfirm,
  loading = false,
}: UpgradeTierModalProps) {
  if (!packageItem) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={560}
      centered
      className="premium-modal upgrade-modal"
    >
      <div className="pt-2 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${packageItem.color}, ${packageItem.color}dd)`,
              color: '#fff',
            }}
          >
            <Sparkles size={28} />
          </div>
          <div>
            <div className="eyebrow !text-primary uppercase tracking-widest text-[10px]">Tier Upgrade</div>
            <h2 className="font-display font-extrabold text-3xl text-ink leading-tight">
              {packageItem.label}
            </h2>
          </div>
        </div>

        <div className="bg-surface-sunken rounded-2xl p-5 mb-6 border border-line">
          <p className="text-[15px] text-ink-muted leading-relaxed">{packageItem.description}</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-extrabold text-ink">
              {formatPence(packageItem.priceMonthly * 100)}
            </span>
            <span className="text-ink-faint text-sm">/ month, billed monthly</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-ink-faint">Key Benefits</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {packageItem.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Check size={12} />
                </div>
                <span className="text-sm text-ink-muted leading-snug">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 p-5 rounded-2xl bg-primary/[0.03] border border-primary/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-ink">
              Modules Unlocked ({packageItem.modules.length}/10)
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {packageItem.modules.map((mNum) => (
              <span
                key={mNum}
                className="px-3 py-1.5 rounded-full bg-white border border-line text-[12px] font-semibold text-ink-muted flex items-center gap-1.5 shadow-sm"
              >
                <span className="text-primary font-bold">{mNum}</span>
                {MODULE_NAMES[mNum - 1]}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-base border border-line mb-8">
          <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="text-[13px] text-ink-muted">
            <span className="font-bold text-ink block">Secure checkout</span>
            Your subscription will be updated immediately. Any unused time on your current plan will be
            credited.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="large"
            onClick={onCancel}
            className="flex-1 rounded-xl h-12 font-bold border-line hover:bg-surface-sunken"
          >
            Maybe later
          </Button>
          <Button
            size="large"
            type="primary"
            loading={loading}
            onClick={() => onConfirm(packageItem._id)}
            className="flex-[1.5] rounded-xl h-12 font-bold shadow-lg shadow-primary/20"
            icon={<ArrowRight size={16} />}
            iconPosition="end"
          >
            Confirm & Pay
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-ink-faint grayscale opacity-50">
          <CreditCard size={14} />
          <span className="text-[10px] uppercase font-bold tracking-widest">Visa</span>
          <span className="text-[10px] uppercase font-bold tracking-widest">Mastercard</span>
          <span className="text-[10px] uppercase font-bold tracking-widest">Amex</span>
        </div>
      </div>
    </Modal>
  );
}
