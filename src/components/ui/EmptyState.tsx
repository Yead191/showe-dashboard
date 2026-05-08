import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: 'default' | 'inline';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-3 py-4 text-sm text-ink-muted', className)}>
        {Icon && <Icon size={18} className="text-ink-faint" />}
        <span>{title}</span>
        {action && <div className="ml-auto">{action}</div>}
      </div>
    );
  }
  return (
    <div className={cn('flex flex-col items-center text-center py-12 px-6', className)}>
      {Icon && (
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-sunken flex items-center justify-center text-ink-muted">
            <Icon size={22} strokeWidth={1.75} />
          </div>
          <div
            aria-hidden
            className="absolute -inset-3 rounded-3xl bg-primary/5 -z-10 blur-xl"
          />
        </div>
      )}
      <h3 className="font-display font-bold text-lg text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
