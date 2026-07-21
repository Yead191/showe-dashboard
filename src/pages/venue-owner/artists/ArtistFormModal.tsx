import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button } from 'antd';
import { toast } from 'sonner';
import { ImageUploader } from '@/features/events/components/ImageUploader';
import { getImageUrl } from '@/helpers/getImageUrl';
import {
  useCreateArtistMutation,
  useUpdateArtistMutation,
  type ApiArtist,
} from '@/store/api/organizationApi/artistApi';
import { getApiErrorMessage } from '@/lib/api-error';

const ARTIST_TYPE_OPTIONS = [
  { value: 'Solo Artist', label: 'Solo Artist' },
  { value: 'Band', label: 'Band' },
  { value: 'DJ', label: 'DJ' },
  { value: 'Orchestra', label: 'Orchestra' },
  { value: 'Comedian', label: 'Comedian' },
];

interface ArtistFormModalProps {
  open: boolean;
  editing: ApiArtist | null;
  onCancel: () => void;
}

type FormShape = {
  name: string;
  type: string;
  career_start_year?: number;
  genres?: string[];
  instruments?: string[];
  languages?: string[];
  origin?: string;
  short_description?: string;
  category?: string;
};

export function ArtistFormModal({ open, editing, onCancel }: ArtistFormModalProps) {
  const [form] = Form.useForm<FormShape>();
  const [imageFile, setImageFile] = useState<string | File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<string | File | null>(null);
  const [createArtist, { isLoading: isCreating }] = useCreateArtistMutation();
  const [updateArtist, { isLoading: isUpdating }] = useUpdateArtistMutation();
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        name: editing.name,
        type: editing.type ?? 'Solo Artist',
        career_start_year: editing.career_start_year,
        genres: editing.genres ?? [],
        instruments: editing.instruments ?? [],
        languages: editing.languages ?? [],
        origin: editing.origin ?? '',
        short_description: editing.short_description ?? '',
        category: editing.category ?? '',
      });
      setImageFile(editing.image ? getImageUrl(editing.image) : null);
      setCoverImageFile(editing.cover_image ? getImageUrl(editing.cover_image) : null);
    } else {
      form.resetFields();
      form.setFieldsValue({ type: 'Solo Artist', genres: [], instruments: [], languages: [] });
      setImageFile(null);
      setCoverImageFile(null);
    }
  }, [open, editing, form]);

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      if (!imageFile && !editing) {
        toast.error('Please upload an artist image.');
        return;
      }

      const payload = {
        name: values.name.trim(),
        type: values.type,
        career_start_year: values.career_start_year,
        genres: values.genres ?? [],
        instruments: values.instruments ?? [],
        languages: values.languages ?? [],
        origin: values.origin?.trim() || undefined,
        short_description: values.short_description?.trim() || undefined,
        category: values.category?.trim() || undefined,
        image: imageFile instanceof File ? imageFile : undefined,
        cover_image: coverImageFile instanceof File ? coverImageFile : undefined,
      };

      if (editing) {
        const result = await updateArtist({ id: editing._id, ...payload }).unwrap();
        toast.success(result.message || 'Artist updated.');
      } else {
        const result = await createArtist(payload).unwrap();
        toast.success(result.message || 'Artist added.');
      }
      onCancel();
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      toast.error(
        getApiErrorMessage(err, editing ? 'Failed to update artist.' : 'Failed to add artist.')
      );
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={editing ? 'Edit artist' : 'Add artist'}
      width={720}
      centered
      className="premium-modal"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="primary" onClick={() => void handleSubmit()} loading={isSubmitting}>
            {editing ? 'Save changes' : 'Add artist'}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-4" requiredMark={false}>
        <div className="grid grid-cols-2 gap-4 mb-1">
          <Form.Item label="Artist image" required className="mb-5">
            <ImageUploader value={imageFile} onChange={setImageFile} aspect="1/1" />
            <p className="text-[12px] text-ink-faint mt-2">Square photo recommended.</p>
          </Form.Item>
          <Form.Item label="Cover image" className="mb-5">
            <ImageUploader value={coverImageFile} onChange={setCoverImageFile} aspect="16/9" />
            <p className="text-[12px] text-ink-faint mt-2">Optional landscape cover.</p>
          </Form.Item>
        </div>

        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input className="input-base" placeholder="Enter artist name" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Type is required' }]}
          >
            <Select
              className="w-full premium-select"
              options={ARTIST_TYPE_OPTIONS}
              placeholder="Select type"
            />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input className="input-base" placeholder="Enter category" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="career_start_year" label="Career start year">
            <InputNumber
              className="w-full input-base flex items-center"
              min={1900}
              max={2100}
              placeholder="2025"
            />
          </Form.Item>
          <Form.Item name="origin" label="Origin">
            <Input className="input-base" placeholder="Enter origin" />
          </Form.Item>
        </div>

        <Form.Item name="genres" label="Genres">
          <Select
            mode="tags"
            className="w-full premium-select"
            placeholder="Type and press Enter"
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item name="instruments" label="Instruments">
          <Select
            mode="tags"
            className="w-full premium-select"
            placeholder="Type and press Enter"
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item name="languages" label="Languages">
          <Select
            mode="tags"
            className="w-full premium-select"
            placeholder="Type and press Enter"
            tokenSeparators={[',']}
          />
        </Form.Item>

        <Form.Item name="short_description" label="Short description">
          <Input.TextArea
            className="input-base"
            rows={3}
            placeholder="A short bio that appears on event pages."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
