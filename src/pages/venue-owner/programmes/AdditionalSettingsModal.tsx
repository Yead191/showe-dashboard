import { useState, useEffect } from 'react';
import { Modal, Button, Select } from 'antd';
import { toast } from 'sonner';
import { ImageUploader } from '@/features/events/components/ImageUploader';
import { Settings, Image as ImageIcon, Tag, PoundSterling } from 'lucide-react';
import type { ProgrammeDoc } from '@/types/programme';
import type { ProfileSubscription } from '@/store/api/authApi';
import { uploadImage } from '@/helpers/upload';

const CATEGORIES = [
  'THEATRE', 'SPORTS', 'MUSIC', 'EVENTS', 'MUSEUM', 'COMMUNITY', 'CEREMONIES'
];

interface Props {
  open: boolean;
  onClose: () => void;
  programme: ProgrammeDoc;
  subscription?: ProfileSubscription | null;
  onSave: (updates: Partial<ProgrammeDoc>) => void;
}

export function AdditionalSettingsModal({ open, onClose, programme, subscription, onSave }: Props) {
  const canSell = Boolean(subscription?.is_proggramme_sell);
  const minPrice = subscription?.minimum_programme_price ?? 2;

  const [coverImage, setCoverImage] = useState<string | File | null>(programme.cover_image || null);
  const [price, setPrice] = useState<number>(
    programme.price_pence ? programme.price_pence / 100 : minPrice
  );
  const [category, setCategory] = useState<string | undefined>(programme.category);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCoverImage(programme.cover_image || null);
      setPrice(programme.price_pence ? programme.price_pence / 100 : minPrice);
      setCategory(programme.category);
    }
  }, [open, programme, minPrice]);

  const isPriceValid = !canSell || price >= minPrice;

  const handleSave = async () => {
    if (canSell && price < minPrice) {
      toast.error(`Minimum price must be at least £${minPrice}`);
      return;
    }

    setSaving(true);
    let finalCoverImage = programme.cover_image;

    if (coverImage instanceof File) {
      try {
        finalCoverImage = await uploadImage(coverImage);
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload cover image');
        setSaving(false);
        return;
      }
    } else if (typeof coverImage === 'string') {
      finalCoverImage = coverImage;
    } else if (coverImage === null) {
      finalCoverImage = undefined;
    }

    onSave({
      cover_image: finalCoverImage,
      ...(canSell
        ? { price_pence: Math.round(price * 100), is_free: false }
        : { price_pence: 0, is_free: true }),
      category: category as any,
    });

    toast.success('Additional settings saved');
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      className="!p-0 overflow-hidden !rounded-2xl addition-modal"
      closeIcon={false}
      styles={{ body: { padding: "0 !important" } }}
      centered
    >
      <div className="bg-gradient-to-br from-primary to-primary-800 p-6 flex flex-col gap-2 relative overflow-hidden rounded-t-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/10 blur-xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md shadow-inner">
            <Settings size={20} />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-white leading-tight">Additional Settings</h2>
            <p className="text-white/70 text-[13px] mt-0.5">Configure advanced options for your programme.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-surface-base rounded-b-2xl">
        {/* Cover Image */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <ImageIcon size={14} />
            </div>
            <label className="text-[13px] font-bold text-ink">Cover Image</label>
          </div>
          <ImageUploader
            value={coverImage}
            onChange={setCoverImage}
            aspect="16/9"
          />
        </div>

        {/* Category */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent/20 text-accent flex items-center justify-center shadow-sm">
              <Tag size={14} />
            </div>
            <label className="text-[13px] font-bold text-ink">Category</label>
          </div>
          <Select
            className="w-full h-11"
            placeholder="Select a category"
            value={category}
            onChange={setCategory}
            options={CATEGORIES.map(c => ({ label: c, value: c }))}
          />
        </div>

        {/* Price */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-success/20 text-success flex items-center justify-center shadow-sm">
              <PoundSterling size={14} />
            </div>
            <label className="text-[13px] font-bold text-ink">Programme Price (£)</label>
          </div>
          <input
            type="number"
            min={minPrice}
            step="0.01"
            value={price}
            disabled={!canSell}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className="input-base h-11 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {!canSell && (
            <p className="text-xs text-ink-muted font-medium mt-1">
              Your subscription does not allow selling programmes.
            </p>
          )}
          {canSell && price < minPrice && (
            <p className="text-xs text-danger font-medium mt-1">
              Price must be at least £{minPrice}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-line">
          <Button className="flex-1 h-11 font-semibold hover:bg-surface-sunken" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="primary"
            className="flex-1 h-11 font-bold shadow-soft"
            onClick={handleSave}
            disabled={!isPriceValid}
            loading={saving}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}
