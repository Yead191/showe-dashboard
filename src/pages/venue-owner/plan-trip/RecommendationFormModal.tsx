import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd';
import { Link as LinkIcon, MapPin, Tag, Ruler, Star, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from '@/features/events/components/ImageUploader';
import type { Recommendation, RecommendationType } from '@/constants/mock-recommendation';

const PRICE_OPTIONS = [
  { value: '£', label: '£ — Budget' },
  { value: '££', label: '££ — Moderate' },
  { value: '£££', label: '£££ — Upscale' },
  { value: '££££', label: '££££ — Luxury' },
];

const CATEGORY_HINTS: Record<RecommendationType, string> = {
  restaurants: 'e.g. Fine Dining, Asian Fusion, Steakhouse',
  hotels: 'e.g. Luxury, Boutique, Resort',
  bars: 'e.g. Cocktail Bar, Pub, Brewery',
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
  onSave: (values: Recommendation) => void;
}

type FormShape = Omit<Recommendation, 'id' | 'image'> & {
  image: string | File | null;
};

export function RecommendationFormModal({
  open,
  tab,
  editing,
  onCancel,
  onSave,
}: RecommendationFormModalProps) {
  const [form] = Form.useForm<FormShape>();
  const [imageFile, setImageFile] = useState<string | File | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        name: editing.name,
        category: editing.category,
        rating: editing.rating,
        distance: editing.distance,
        price: editing.price,
        location: editing.location,
        url: editing.url ?? '',
        description: editing.description ?? '',
        image: editing.image,
      });
      setImageFile(editing.image);
    } else {
      form.resetFields();
      setImageFile(null);
    }
  }, [open, editing, form]);

  const labelSingular =
    tab === 'restaurants' ? 'restaurant' : tab === 'hotels' ? 'hotel' : 'bar';

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      if (!imageFile) {
        toast.error('Please upload an image.');
        return;
      }

      const finalImage =
        imageFile instanceof File ? URL.createObjectURL(imageFile) : imageFile;

      const result: Recommendation = {
        id: editing?.id ?? `${tab.slice(0, 3)}_${Date.now()}`,
        name: values.name.trim(),
        image: finalImage,
        category: values.category.trim(),
        rating: Number(values.rating),
        distance: values.distance.trim(),
        price: values.price,
        location: values.location.trim(),
        total_clicks: editing?.total_clicks ?? 0,
        revenue: editing?.revenue ?? 0,
        url: values.url?.trim() || undefined,
        description: values.description?.trim() || undefined,
      };

      onSave(result);
    } catch {
      // antd handles field errors
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
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
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
            <Input className="input-base" placeholder={CATEGORY_HINTS[tab]} />
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
            <Input className="input-base" placeholder="e.g. 0.4 mi" />
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
