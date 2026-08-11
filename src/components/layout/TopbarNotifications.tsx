import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { io, type Socket } from 'socket.io-client';
import { socketUrl } from '@/store/api/baseApi';
import {
  useGetNotificationsQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  type NotificationItem,
} from '@/store/api/topbarNotificationApi';
import { cn, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

interface TopbarNotificationsProps {
  userId?: string;
}

const PAGE_LIMIT = 10;

export function TopbarNotifications({ userId }: TopbarNotificationsProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const role = useAuthStore((s) => s.user?.role);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    refetch: refetchNotifications,
    isFetching,
    isLoading,
  } = useGetNotificationsQuery(
    { page, limit: PAGE_LIMIT },
    { skip: !userId },
  );
  const [readNotification] = useReadNotificationMutation();
  const [readAllNotifications] = useReadAllNotificationsMutation();

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const totalPage = data?.pagination?.totalPage ?? 1;
  const hasMore = page < totalPage;

  const resetAndRefetch = useCallback(() => {
    setPage(1);
    void refetchNotifications();
  }, [refetchNotifications]);

  useEffect(() => {
    if (!userId) return;

    const socket: Socket = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    const eventName = `get-notification::${userId}`;
    socket.on(eventName, resetAndRefetch);

    return () => {
      socket.off(eventName, resetAndRefetch);
      socket.disconnect();
    };
  }, [resetAndRefetch, userId]);

  useEffect(() => {
    if (!open) return;
    const root = listRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (!hasMore || isFetching) return;
        setPage((prev) => prev + 1);
      },
      {
        root,
        rootMargin: '80px',
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasMore, isFetching, notifications.length]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setPage(1);
    }
  };

  const handleRead = (notification: NotificationItem) => {
    // Only unread items (`isRead === false`) can be marked as read.
    if (notification.isRead === true) return;

    toast.promise(
      readNotification({ id: notification._id })
        .unwrap()
        .then(() => {
          setPage(1);
        }),
      {
        loading: 'Marking notification as read...',
        success: 'Notification marked as read.',
        error: 'Failed to update notification.',
      },
    );
  };

  const handleReadAll = () => {
    if (!notifications.length || unreadCount === 0) return;

    toast.promise(
      readAllNotifications()
        .unwrap()
        .then(() => {
          setPage(1);
        }),
      {
        loading: 'Marking all notifications as read...',
        success: 'All notifications marked as read.',
        error: 'Failed to update notifications.',
      },
    );
  };

  const content = (
    <div className="w-[360px] overflow-hidden rounded-2xl">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-line">
        <div>
          <div className="font-display font-bold text-base text-ink">Notifications</div>
          <p className="text-[12px] text-ink-muted mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleReadAll}
            disabled={isFetching}
            className="text-[12px] font-semibold text-primary hover:text-primary-700 transition-colors disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      <div ref={listRef} className="max-h-[420px] overflow-x-hidden overflow-y-auto">
        {isLoading && notifications.length === 0 ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-sunken flex items-center justify-center text-ink-faint mx-auto mb-3">
              <Bell size={18} />
            </div>
            <p className="text-sm text-ink-muted">No notifications.</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => {
              const isUnread = notification.isRead === false;
              return (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => handleRead(notification)}
                  className={cn(
                    'group relative flex items-start gap-3 px-4 py-3 w-full text-left hover:bg-surface-sunken transition-colors',
                    isUnread && 'bg-primary/[0.025]',
                  )}
                >
                  <span
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: isUnread
                        ? 'rgba(1,75,82,0.10)'
                        : 'rgba(40,37,29,0.06)',
                      color: isUnread ? '#014B52' : '#6C665D',
                    }}
                  >
                    <Bell size={15} strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm text-ink leading-tight">
                        {notification.title}
                      </div>
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-[12.5px] text-ink-muted leading-snug mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="text-[11px] text-ink-faint mt-1.5">
                      {timeAgo(notification.createdAt)}
                    </div>
                  </div>
                </button>
              );
            })}

            <div ref={sentinelRef} className="h-4" aria-hidden />

            {isFetching && page > 1 && (
              <div className="flex justify-center py-3">
                <Spin size="small" />
              </div>
            )}

            {!hasMore && notifications.length > 0 && (
              <div className="px-4 py-3 text-center text-[11px] text-ink-faint">
                You're all caught up
              </div>
            )}
          </>
        )}
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
      onOpenChange={handleOpenChange}
      content={content}
      trigger={['click']}
      placement="bottomRight"
      arrow={false}
      overlayInnerStyle={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}
    >
      <button
        type="button"
        aria-label="Notifications"
        className={cn(
          'relative w-10 h-10 rounded-full bg-surface-raised border border-line hover:border-line-strong',
          'flex items-center justify-center text-ink-muted hover:text-ink',
          'transition-all duration-200 ease-smooth shadow-soft hover:-translate-y-px',
        )}
      >
        <Bell size={17} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-ink text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-surface-raised tabular">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </Popover>
  );
}
