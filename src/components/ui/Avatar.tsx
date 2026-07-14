import { useEffect, useState } from 'react';
import { cn, initials } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: number; // px
  className?: string;
  ring?: boolean;
}

export function Avatar({ src, name, size = 36, className, ring = false }: AvatarProps) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  const showImage = Boolean(src) && !errored;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-surface-sunken text-ink font-semibold select-none',
        ring && 'ring-2 ring-surface-raised shadow-soft',
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
    >
      {showImage ? (
        <img
          key={src}
          src={src}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="leading-none">{initials(name)}</span>
      )}
    </div>
  );
}
