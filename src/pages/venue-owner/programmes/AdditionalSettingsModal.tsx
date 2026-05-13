import { useState, useEffect } from 'react';
import { Modal, Button, Select } from 'antd';
import { toast } from 'sonner';
import { ImageUploader } from '@/features/events/components/ImageUploader';
import { Settings, Image as ImageIcon, Tag, PoundSterling } from 'lucide-react';
import type { ProgrammeDoc } from '@/types/programme';

const CATEGORIES = [
  'THEATRE', 'SPORTS', 'MUSIC', 'EVENTS', 'MUSEUM', 'COMMUNITY', 'CEREMONIES'
];

interface Props {
  open: boolean;
  onClose: () => void;
  programme: ProgrammeDoc;
  onSave: (updates: Partial<ProgrammeDoc>) => void;
}

export function AdditionalSettingsModal({ open, onClose, programme, onSave }: Props) {
  const [coverImage, setCoverImage] = useState<string | File | null>(programme.cover_image || null);
  // price is stored in pence
  const [price, setPrice] = useState<number>(programme.price_pence ? programme.price_pence / 100 : 2);
  const [category, setCategory] = useState<string | undefined>(programme.category);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setCoverImage(programme.cover_image || null);
      setPrice(programme.price_pence ? programme.price_pence / 100 : 2);
      setCategory(programme.category);
    }
  }, [open, programme]);

  const handleSave = async () => {
    if (price < 2) {
      toast.error('Minimum price must be at least £2');
      return;
    }

    setSaving(true);
    let finalCoverImage = programme.cover_image;

    if (coverImage instanceof File) {
      // Convert to base64 for local storage (mock upload)
      finalCoverImage = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(coverImage);
      });
    } else if (typeof coverImage === 'string') {
      finalCoverImage = coverImage;
    } else if (coverImage === null) {
      finalCoverImage = undefined;
    }

    onSave({
      cover_image: finalCoverImage,
      price_pence: Math.round(price * 100),
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
            <label className="text-[13px] font-bold text-ink">Minimum Price (£)</label>
          </div>
          <input
            type="number"
            min="2"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className="input-base h-11 text-base font-semibold"
          />
          {price < 2 && (
            <p className="text-xs text-danger font-medium mt-1">Price must be at least £2</p>
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
            disabled={price < 2}
            loading={saving}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}
