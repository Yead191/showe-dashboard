import { Crown, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminRole } from '@/types/admin';

interface AdminRoleBadgeProps {
  role: AdminRole | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AdminRoleBadge({
  role,
  size = 'md',
  className,
}: AdminRoleBadgeProps) {
  const isSuper = role === 'SUPER_ADMIN';

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 13 : 15;

  if (isSuper) {
    return (
      <span
        className={cn(
          'inline-flex items-center font-semibold rounded-full border transition-all select-none',
          'bg-gradient-to-r from-accent/15 via-accent/10 to-purple-500/10 text-[#8A5C00] border-accent/30 shadow-sm',
          sizeClasses,
          className
        )}
      >
        <Crown size={iconSize} className="text-[#8A5C00] animate-pulse-subtle" />
        <span>Super Admin</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-all select-none',
        'bg-primary/8 text-primary border-primary/20',
        sizeClasses,
        className
      )}
    >
      <ShieldCheck size={iconSize} className="text-primary" />
      <span>Admin</span>
    </span>
  );
}
