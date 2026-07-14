import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd';
import { Link as LinkIcon, MapPin, Tag, Ruler, Star, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from '@/features/events/components/ImageUploader';
import { getImageUrl } from '@/helpers/getImageUrl';
import {
  useCreateOrganizationRecommendationMutation,
  useUpdateOrganizationRecommendationMutation,
} from '@/store/api/organizationApi/recommendationApi';
import type { Recommendation, RecommendationType } from '@/constants/mock-recommendation';

const PRICE_OPTIONS = [
  { value: '£', label: '£ — Budget' },
  { value: '££', label: '££ — Moderate' },
  { value: '£££', label: '£££ — Upscale' },
  { value: '££££', label: '££££ — Luxury' },
];

const CATEGORY_OPTIONS = [
  { value: 'restrudants', label: 'Restaurant' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'bar', label: 'Bar' },
  { value: 'other', label: 'Other' },
];

export const TAB_TO_API_CATEGORY: Record<RecommendationType, string> = {
  restaurants: 'restrudants',
  hotels: 'hotel',
  bars: 'bar',
};

const NAME_HINTS: Record<RecommendationType, string> = {
  restaurants: 'The Gilded Fork',
  hotels: 'Grand Horizon Hotel',
  bars: 'The Velvet Lounge',
};

interface RecommendationFormModalProps {
  open: boolean;
  tab: RecommendationType;
  editing: Recommendation | null;
  onCancel: () => void;
}

type FormShape = {
  name: string;
  category: string;
  rating: number;
  distance: string;
  price: string;
  location: string;
  url?: string;
  description?: string;
};

export function RecommendationFormModal({
  open,
  tab,
  editing,
  onCancel,
}: RecommendationFormModalProps) {
  const [form] = Form.useForm<FormShape>();
  const [imageFile, setImageFile] = useState<string | File | null>(null);
  const [createRecommendation, { isLoading: isCreating }] =
    useCreateOrganizationRecommendationMutation();
  const [updateRecommendation, { isLoading: isUpdating }] =
    useUpdateOrganizationRecommendationMutation();
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        name: editing.name,
        category: normalizeCategory(editing.category, tab),
        rating: editing.rating,
        distance: editing.distance,
        price: toPoundPrice(editing.price),
        location: editing.location,
        url: editing.url ?? '',
        description: editing.description ?? '',
      });
      setImageFile(editing.image ? getImageUrl(editing.image) : null);
    } else {
      form.resetFields();
      form.setFieldsValue({ category: TAB_TO_API_CATEGORY[tab] });
      setImageFile(null);
    }
  }, [open, editing, form, tab]);

  const labelSingular =
    tab === 'restaurants' ? 'restaurant' : tab === 'hotels' ? 'hotel' : 'bar';

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      if (!imageFile && !editing) {
        toast.error('Please upload an image.');
        return;
      }

      const payload = {
        name: values.name.trim(),
        category: values.category,
        rating: Number(values.rating),
        distance: values.distance.trim(),
        price: values.price,
        location: values.location.trim(),
        description: values.description?.trim() || undefined,
        website: values.url?.trim() || undefined,
        image: imageFile instanceof File ? imageFile : undefined,
      };

      if (editing) {
        const result = await updateRecommendation({ id: editing.id, ...payload }).unwrap();
        toast.success(result.message || 'Recommendation updated.');
      } else {
        const result = await createRecommendation(payload).unwrap();
        toast.success(result.message || 'Recommendation added.');
      }
      onCancel();
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message || (editing ? 'Failed to update recommendation.' : 'Failed to add recommendation.'));
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={editing ? `Edit ${labelSingular}` : `Add ${labelSingular}`}
      width={680}
      centered
      className="premium-modal"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isSubmitting}>
            {editing ? 'Save changes' : 'Add recommendation'}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-4" requiredMark={false}>
        <Form.Item label="Photo" required className="mb-5">
          <ImageUploader
            value={imageFile}
            onChange={(f) => setImageFile(f)}
            aspect="16/9"
          />
          <p className="text-[12px] text-ink-faint mt-2">
            Upload a landscape image (1600 × 900 recommended). JPG or PNG.
          </p>
        </Form.Item>

        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input className="input-base" placeholder={NAME_HINTS[tab]} />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="category"
            label={
              <span className="inline-flex items-center gap-1.5">
                <Tag size={12} /> Category
              </span>
            }
            rules={[{ required: true, message: 'Category is required' }]}
          >
            <Select
              className="w-full premium-select"
              options={CATEGORY_OPTIONS}
              placeholder="Select category"
            />
          </Form.Item>

          <Form.Item
            name="distance"
            label={
              <span className="inline-flex items-center gap-1.5">
                <Ruler size={12} /> Distance
              </span>
            }
            rules={[{ required: true, message: 'Distance is required' }]}
          >
            <Input className="input-base" placeholder="e.g. 3.5 km" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="rating"
            label={
              <span className="inline-flex items-center gap-1.5">
                <Star size={12} /> Rating
              </span>
            }
            rules={[{ required: true, message: 'Rating is required' }]}
          >
            <InputNumber
              className="w-full input-base flex items-center"
              min={0}
              max={5}
              step={0.1}
              placeholder="4.5"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label={
              <span className="inline-flex items-center gap-1.5">
                <Banknote size={12} /> Price tier
              </span>
            }
            rules={[{ required: true, message: 'Price tier is required' }]}
          >
            <Select
              className="w-full premium-select"
              placeholder="Select price tier"
              options={PRICE_OPTIONS}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="location"
          label={
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} /> Location
            </span>
          }
          rules={[{ required: true, message: 'Location is required' }]}
        >
          <Input
            className="input-base"
            placeholder="Street address, city, postcode"
          />
        </Form.Item>

        <Form.Item
          name="url"
          label={
            <span className="inline-flex items-center gap-1.5">
              <LinkIcon size={12} /> Website URL
            </span>
          }
          rules={[
            {
              type: 'url',
              message: 'Enter a valid URL (https://...)',
            },
          ]}
        >
          <Input
            className="input-base"
            placeholder="https://example.com"
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            className="input-base"
            rows={3}
            placeholder="A short summary that will appear on event pages and programmes."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function normalizeCategory(category: string, tab: RecommendationType): string {
  const normalized = category.trim().toLowerCase();
  if (['hotel', 'bar', 'restrudants', 'other'].includes(normalized)) {
    return normalized;
  }
  return TAB_TO_API_CATEGORY[tab];
}

/** Normalize legacy `$` price tiers to `£` for the form select. */
function toPoundPrice(price: string): string {
  const trimmed = price.trim();
  if (/^\$+$/.test(trimmed)) {
    return '£'.repeat(trimmed.length);
  }
  return trimmed;
}
