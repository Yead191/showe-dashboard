import { Modal, Button } from 'antd';
import { Check, ArrowRight, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import type { AddOn } from '@/constants/addons';
import { formatPence } from '@/lib/utils';
import { ADDON_ICONS } from '@/constants/addon-icons';

interface AddOnPurchaseModalProps {
  open: boolean;
  addon: AddOn | null;
  mode: 'purchase' | 'cancel';
  onCancel: () => void;
  onConfirm: (addon: AddOn) => void;
  loading?: boolean;
}

export function AddOnPurchaseModal({
  open,
  addon,
  mode,
  onCancel,
  onConfirm,
  loading = false,
}: AddOnPurchaseModalProps) {
  if (!addon) return null;
  const Icon = ADDON_ICONS[addon.icon] ?? Sparkles;
  const isCancel = mode === 'cancel';

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={520}
      centered
      className="premium-modal upgrade-modal"
    >
      <div className="pt-2 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${addon.color}, ${addon.color}dd)`,
              color: '#fff',
            }}
          >
            <Icon size={26} />
          </div>
          <div>
            <div className="eyebrow !text-primary uppercase tracking-widest text-[10px]">
              {isCancel ? 'Remove Add-On' : 'Optional Add-On'}
            </div>
            <h2 className="font-display font-extrabold text-2xl text-ink leading-tight">
              {addon.label}
            </h2>
          </div>
        </div>

        <div className="bg-surface-sunken rounded-2xl p-5 mb-5 border border-line">
          <p className="text-[14.5px] text-ink-muted leading-relaxed">{addon.description}</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-extrabold text-ink tabular">
              {formatPence(addon.price * 100)}
            </span>
            <span className="text-ink-faint text-sm">/ month</span>
          </div>
        </div>

        {!isCancel && (
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-ink-faint">What you get</h4>
            <div className="space-y-2.5">
              {addon.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${addon.color}15`, color: addon.color }}
                  >
                    <Check size={11} strokeWidth={4} />
                  </div>
                  <span className="text-[13.5px] text-ink-muted leading-snug">{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-base border border-line mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCancel ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
            <ShieldCheck size={20} />
          </div>
          <div className="text-[13px] text-ink-muted">
            {isCancel ? (
              <>
                <span className="font-bold text-ink block">Heads up</span>
                Access continues until the end of the current billing period. You will not be charged again.
              </>
            ) : (
              <>
                <span className="font-bold text-ink block">Added to your subscription</span>
                {formatPence(addon.price * 100)} will be added to your next invoice. Cancel anytime.
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="large"
            onClick={onCancel}
            className="flex-1 rounded-xl h-12 font-bold border-line hover:bg-surface-sunken"
          >
            {isCancel ? 'Keep add-on' : 'Maybe later'}
          </Button>
          <Button
            size="large"
            type="primary"
            danger={isCancel}
            loading={loading}
            onClick={() => onConfirm(addon)}
            className="flex-[1.5] rounded-xl h-12 font-bold shadow-lg"
            icon={!isCancel ? <ArrowRight size={16} /> : undefined}
            iconPosition="end"
          >
            {isCancel ? 'Remove add-on' : 'Confirm & Pay'}
          </Button>
        </div>

        {!isCancel && (
          <div className="mt-4 flex items-center justify-center gap-4 text-ink-faint grayscale opacity-50">
            <CreditCard size={14} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Visa</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Mastercard</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Amex</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
