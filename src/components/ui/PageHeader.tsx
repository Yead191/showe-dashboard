import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-7',
        className
      )}
    >
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <div className="eyebrow mb-2.5">{eyebrow}</div>}
        <h1 className="font-display font-extrabold tracking-tight text-3xl md:text-[32px] leading-[1.05] text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 text-ink-muted text-[15px] leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 md:flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}
