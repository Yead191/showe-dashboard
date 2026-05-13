import { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: string | File | null;
  onChange: (v: File | null) => void;
  onClear?: () => void;
  aspect?: string;
  small?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  onClear,
  aspect = '16/9',
  small,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (onClear) onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border border-dashed border-line overflow-hidden bg-surface-sunken cursor-pointer group hover:border-primary transition-colors',
        small ? 'w-24' : 'w-full',
      )}
      style={{ aspectRatio: aspect }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="!hidden"
      />
      {preview ? (
        <>
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <X size={13} />
          </button>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-muted group-hover:text-primary group-hover:bg-primary/5 transition-colors">
          <ImageIcon size={small ? 16 : 22} />
          <span className="text-[12px] font-semibold text-center px-2">
            Click to upload image
          </span>
        </div>
      )}
    </div>
  );
}
