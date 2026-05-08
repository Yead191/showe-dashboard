import { Search } from 'lucide-react';
import { VenueSwitcher } from './VenueSwitcher';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import { useAuthStore } from '@/store/auth.store';

export function TopBar() {
  const role = useAuthStore((s) => s.user?.role);

  return (
    <header className="sticky top-0 z-30 bg-surface-base/85 backdrop-blur-md border-b border-line/70">
      <div className="px-5 lg:px-8 h-16 flex items-center gap-3">
        {/* Left — venue switcher (only for venue owners) */}
        {role === 'venue_owner' && <VenueSwitcher />}
        {role === 'super_admin' && (
          <div className="inline-flex items-center gap-2 h-10 px-3 rounded-full bg-primary text-ink-inverse">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            <span className="text-[12px] font-semibold uppercase tracking-wider">Platform admin</span>
          </div>
        )}

        {/* Search */}
        <div className="flex-1 hidden md:flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
            />
            <input
              placeholder={role === 'super_admin' ? 'Search venues, users, payments…' : 'Search programmes, events, refunds…'}
              className="w-full h-10 pl-10 pr-12 rounded-full bg-surface-raised border border-line focus:border-primary focus:shadow-ring outline-none text-sm placeholder:text-ink-faint transition-all duration-200 ease-smooth"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-ink-faint bg-surface-sunken px-1.5 py-0.5 rounded border border-line">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2.5">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
