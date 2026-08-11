import { useState } from 'react';
import { Bell, ShoppingBag, RefreshCcw, CreditCard, Calendar, AlertTriangle, Building2, X } from 'lucide-react';
import { Popover } from 'antd';
import { Link } from 'react-router-dom';
import type { DashboardNotification, NotificationType } from '@/types';
import { mockNotifications, mockAdminNotifications } from '@/constants/mock-data';
import { cn, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const ICON_MAP: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  programme_purchase: { icon: ShoppingBag, color: '#437A22', bg: 'rgba(67,122,34,0.10)' },
  refund_request: { icon: RefreshCcw, color: '#DA7101', bg: 'rgba(218,113,1,0.12)' },
  subscription_renewal: { icon: CreditCard, color: '#006494', bg: 'rgba(0,100,148,0.10)' },
  payment_failed: { icon: AlertTriangle, color: '#B42318', bg: 'rgba(180,35,24,0.10)' },
  venue_invite: { icon: Building2, color: '#7A39BB', bg: 'rgba(122,57,187,0.10)' },
  system_alert: { icon: AlertTriangle, color: '#6C665D', bg: 'rgba(40,37,29,0.06)' },
  event_published: { icon: Calendar, color: '#014B52', bg: 'rgba(1,75,82,0.10)' },
};

export function NotificationBell() {
  const role = useAuthStore((s) => s.user?.role);
  const initial = role === 'SUPER_ADMIN' ? mockAdminNotifications : mockNotifications;
  const [items, setItems] = useState<DashboardNotification[]>(initial);
  const [open, setOpen] = useState(false);
  const unread = items.filter((i) => !i.is_read).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  const content = (
    <div className="w-[360px] -m-1.5">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-line">
        <div>
          <div className="font-display font-bold text-base text-ink">Notifications</div>
          <p className="text-[12px] text-ink-muted mt-0.5">
            {unread > 0 ? `${unread} unread` : 'You’re all caught up.'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-[12px] font-semibold text-primary hover:text-primary-700 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto py-1">
        {items.length === 0 && (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-sunken flex items-center justify-center text-ink-faint mx-auto mb-3">
              <Bell size={18} />
            </div>
            <p className="text-sm text-ink-muted">No notifications.</p>
          </div>
        )}
        {items.map((n) => {
          const meta = ICON_MAP[n.type];
          const Icon = meta.icon;
          return (
            <Link
              to={n.link ?? '#'}
              key={n.id}
              onClick={() => setOpen(false)}
              className={cn(
                'group relative flex items-start gap-3 px-4 py-3 hover:bg-surface-sunken transition-colors',
                !n.is_read && 'bg-primary/[0.025]'
              )}
            >
              <span
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: meta.bg, color: meta.color }}
              >
                <Icon size={15} strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm text-ink leading-tight">{n.title}</div>
                  {!n.is_read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-[12.5px] text-ink-muted leading-snug mt-0.5">{n.message}</p>
                <div className="text-[11px] text-ink-faint mt-1.5">{timeAgo(n.created_at)}</div>
              </div>
              <button
                aria-label="Dismiss"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dismiss(n.id);
                }}
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full flex items-center justify-center bg-surface-raised border border-line text-ink-muted hover:text-ink"
              >
                <X size={11} />
              </button>
            </Link>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-line text-center">
        <Link
          to={
            role === 'SUPER_ADMIN'
              ? '/admin/settings?tabs=audit'
              : '/owner/settings?tabs=audit'
          }
          className="text-[12px] font-semibold text-primary hover:text-primary-700 transition-colors"
          onClick={() => setOpen(false)}
        >
          See activity log
        </Link>
      </div>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={content}
      trigger={['click']}
      placement="bottomRight"
      arrow={false}
      overlayInnerStyle={{ padding: 0, borderRadius: 16 }}
    >
      <button
        aria-label="Notifications"
        className={cn(
          'relative w-10 h-10 rounded-full bg-surface-raised border border-line hover:border-line-strong',
          'flex items-center justify-center text-ink-muted hover:text-ink',
          'transition-all duration-200 ease-smooth shadow-soft hover:-translate-y-px'
        )}
      >
        <Bell size={17} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 inline-flex">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-accent ring-2 ring-surface-raised" />
          </span>
        )}
      </button>
    </Popover>
  );
}
