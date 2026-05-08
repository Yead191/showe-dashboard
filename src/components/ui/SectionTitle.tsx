import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({ title, description, action, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-end justify-between gap-3 mb-4', className)}>
      <div>
        <h2 className="font-display font-bold text-lg text-ink leading-tight">{title}</h2>
        {description && <p className="text-sm text-ink-muted mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
