import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
  variant?: 'default' | 'flat' | 'deep';
}

export function Panel({
  title,
  description,
  eyebrow,
  action,
  padded = true,
  variant = 'default',
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border transition-shadow',
        variant === 'default' && 'bg-surface-raised border-line shadow-soft',
        variant === 'flat' && 'bg-surface-sunken border-transparent',
        variant === 'deep' && 'panel-deep border-transparent text-ink-inverse',
        className
      )}
      {...rest}
    >
      {(title || eyebrow || action) && (
        <header
          className={cn(
            'flex items-start justify-between gap-4',
            padded ? 'p-6 pb-4' : 'pt-2 px-2 pb-3',
            !children && 'pb-0'
          )}
        >
          <div className="min-w-0">
            {eyebrow && (
              <div
                className={cn(
                  'eyebrow mb-2',
                  variant === 'deep' && 'text-accent-300'
                )}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <h3
                className={cn(
                  'font-display font-bold tracking-tight text-xl leading-tight',
                  variant === 'deep' ? 'text-ink-inverse' : 'text-ink'
                )}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                className={cn(
                  'mt-1 text-sm',
                  variant === 'deep' ? 'text-ink-inverse/75' : 'text-ink-muted'
                )}
              >
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0 relative z-[1]">{action}</div>}
        </header>
      )}
      {children && <div className={cn('relative z-[1]', padded && 'px-6 pb-6', !title && padded && 'pt-6')}>{children}</div>}
    </section>
  );
}
