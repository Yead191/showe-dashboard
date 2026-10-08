import { Tooltip } from 'antd';
import { KeyRound, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPermissionsBadgeProps {
  permissions?: string[];
  maxVisible?: number;
  showIcon?: boolean;
  className?: string;
}

export function AdminPermissionsBadge({
  permissions = [],
  maxVisible = 2,
  showIcon = false,
  className,
}: AdminPermissionsBadgeProps) {
  if (!permissions || permissions.length === 0) {
    return (
      <span className="text-xs text-ink-faint italic flex items-center gap-1">
        <KeyRound size={12} className="opacity-50" />
        No permissions assigned
      </span>
    );
  }

  const visible = permissions.slice(0, maxVisible);
  const remaining = permissions.slice(maxVisible);

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {visible.map((perm) => (
        <span
          key={perm}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-surface-sunken text-ink-muted border border-line"
        >
          {showIcon && <Shield size={10} className="text-primary opacity-70" />}
          {perm}
        </span>
      ))}

      {remaining.length > 0 && (
        <Tooltip
          title={
            <div className="p-1 space-y-1">
              <div className="text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                Additional Permissions ({remaining.length})
              </div>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {remaining.map((item) => (
                  <span
                    key={item}
                    className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-white/20 text-white font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          }
          placement="top"
        >
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors">
            +{remaining.length} more
          </span>
        </Tooltip>
      )}
    </div>
  );
}
