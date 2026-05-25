import { useState, useEffect, useRef } from 'react';
import { Modal, Input, Switch, DatePicker, Button } from 'antd';
import { Upload, X, Link, Calendar, ToggleRight } from 'lucide-react';
import dayjs from 'dayjs';
import type { Ad } from '../types';

interface AdModalProps {
  open: boolean;
  ad: Ad | null;
  onCancel: () => void;
  onSave: (formData: FormData, values: Partial<Ad>) => void;
}

interface AdFormState {
  title: string;
  description: string;
  redirectUrl: string;
  startDate: string;
  endDate: string;
  active: boolean;
  imageFile: File | null;
  imagePreview: string | null;
}

const DEFAULT_FORM: AdFormState = {
  title: '',
  description: '',
  redirectUrl: '',
  startDate: '',
  endDate: '',
  active: true,
  imageFile: null,
  imagePreview: null,
};

export function AdModal({ open, ad, onCancel, onSave }: AdModalProps) {
  const [form, setForm] = useState<AdFormState>(DEFAULT_FORM);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset / pre-fill when modal opens
  useEffect(() => {
    if (open) {
      if (ad) {
        setForm({
          title: ad.title,
          description: ad.description,
          redirectUrl: ad.redirectUrl,
          startDate: ad.startDate,
          endDate: ad.endDate,
          active: ad.active,
          imageFile: null,
          imagePreview: ad.imageUrl ?? null,
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [open, ad]);

  function set<K extends keyof AdFormState>(key: K, value: AdFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageFile: file, imagePreview: preview }));
  }

  function clearImage() {
    if (form.imagePreview && form.imageFile) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setForm((prev) => ({ ...prev, imageFile: null, imagePreview: null }));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  }

  function handleSubmit() {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('redirectUrl', form.redirectUrl);
    fd.append('startDate', form.startDate);
    fd.append('endDate', form.endDate);
    fd.append('active', String(form.active));
    if (form.imageFile) fd.append('image', form.imageFile);

    const values: Partial<Ad> = {
      title: form.title,
      description: form.description,
      redirectUrl: form.redirectUrl,
      startDate: form.startDate,
      endDate: form.endDate,
      active: form.active,
      imageUrl: form.imagePreview ?? undefined,
    };

    onSave(fd, values);
  }

  const isValid = form.title.trim() && form.redirectUrl.trim() && form.startDate && form.endDate;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <span className="font-display font-bold text-ink">
          {ad ? 'Edit ad' : 'Create new ad'}
        </span>
      }
      centered
      width={540}
      footer={
        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} disabled={!isValid}>
            {ad ? 'Update ad' : 'Create ad'}
          </Button>
        </div>
      }
      className="premium-modal"
    >
      <div className="space-y-5 pt-2">
        {/* Title */}
        <div>
          <label className="field-label">Ad title</label>
          <Input
            placeholder="e.g. Summer Menu – The Gilded Fork"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="input-base"
          />
        </div>

        {/* Description */}
        <div>
          <label className="field-label">Description</label>
          <Input.TextArea
            placeholder="Brief description of this ad campaign…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className="input-base text-sm leading-relaxed"
            rows={3}
            maxLength={300}
            showCount
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="field-label">Ad image</label>
          {form.imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-line group">
              <img
                src={form.imagePreview}
                alt="Ad preview"
                className="w-full h-44 object-cover"
              />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="small"
                  icon={<Upload size={13} />}
                  onClick={() => fileInputRef.current?.click()}
                  className="!bg-white/90 !text-ink !border-0 font-semibold text-xs"
                >
                  Replace
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<X size={13} />}
                  onClick={clearImage}
                  className="!bg-white/90 !border-0 font-semibold text-xs"
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${dragging ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/50 hover:bg-surface-sunken/40'}
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/8 text-primary">
                  <Upload size={18} />
                </span>
                <p className="text-sm font-semibold text-ink">
                  Drop image here, or <span className="text-primary underline underline-offset-2">browse</span>
                </p>
                <p className="text-[12px] text-ink-faint">PNG, JPG, WEBP up to 5 MB</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* Redirect URL */}
        <div>
          <label className="field-label flex items-center gap-1.5">
            <Link size={12} className="text-ink-faint" /> Redirect URL
          </label>
          <Input
            placeholder="https://example.com/campaign"
            value={form.redirectUrl}
            onChange={(e) => set('redirectUrl', e.target.value)}
            className="input-base"
            prefix={<span className="text-ink-faint text-xs select-none">URL</span>}
          />
        </div>

        {/* Date range */}
        <div>
          <label className="field-label flex items-center gap-1.5">
            <Calendar size={12} className="text-ink-faint" /> Campaign dates
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-ink-faint mb-1">Start date</p>
              <DatePicker
                className="w-full h-11"
                value={form.startDate ? dayjs(form.startDate) : null}
                onChange={(d) => set('startDate', d ? d.format('YYYY-MM-DD') : '')}
                format="DD MMM YYYY"
                placeholder="Pick start"
              />
            </div>
            <div>
              <p className="text-[11px] text-ink-faint mb-1">End date</p>
              <DatePicker
                className="w-full h-11"
                value={form.endDate ? dayjs(form.endDate) : null}
                onChange={(d) => set('endDate', d ? d.format('YYYY-MM-DD') : '')}
                format="DD MMM YYYY"
                placeholder="Pick end"
                disabledDate={(d) => form.startDate ? d.isBefore(dayjs(form.startDate)) : false}
              />
            </div>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between rounded-xl border border-line bg-surface-sunken/30 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <ToggleRight size={16} className="text-ink-muted" />
            <div>
              <p className="text-sm font-semibold text-ink">Active</p>
              <p className="text-[11px] text-ink-faint">Ad will be visible in programmes</p>
            </div>
          </div>
          <Switch
            checked={form.active}
            onChange={(v) => set('active', v)}
          />
        </div>
      </div>
    </Modal>
  );
}
