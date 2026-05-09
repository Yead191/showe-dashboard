import { X } from 'lucide-react';
import { FieldGroup } from './FieldGroup';
import { ImageUploader } from './ImageUploader';
import type { EventFormState } from '../types';

interface MediaTabProps {
  state: EventFormState;
  update: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

export function MediaTab({ state, update }: MediaTabProps) {
  const addGalleryImage = (file: File | null) => {
    if (file) {
      update('gallery', [...state.gallery, file]);
    }
  };

  const removeGalleryImage = (index: number) => {
    update('gallery', state.gallery.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <FieldGroup label="Cover image" required hint="Recommended: 1600 × 900px, mobile-safe">
        <ImageUploader
          value={state.cover_image}
          onChange={(v) => update('cover_image', v)}
          aspect="16/9"
        />
      </FieldGroup>

      <FieldGroup label="Gallery" hint="Add up to 8 images. Square or landscape work best.">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {state.gallery.map((item, i) => {
            const preview = typeof item === 'string' ? item : URL.createObjectURL(item);
            return (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden border border-line group"
              >
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
          {state.gallery.length < 8 && (
            <div className="aspect-square">
              <ImageUploader
                value={null}
                onChange={addGalleryImage}
                aspect="1/1"
                small
              />
            </div>
          )}
        </div>
      </FieldGroup>
    </div>
  );
}
