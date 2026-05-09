import { Link, NavLink, useLocation } from 'react-router-dom';
import type { NavGroup } from '@/constants/navigation';
import { Logo } from '@/components/ui';
import { cn } from '@/lib/utils';
import { LifeBuoy, ChevronRight } from 'lucide-react';

interface SidebarProps {
  groups: NavGroup[];
  roleLabel: string;
}

export function Sidebar({ groups, roleLabel }: SidebarProps) {
  const { pathname } = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 2xl:w-72 shrink-0 h-dvh sticky top-0 border-r border-line bg-surface-raised">
      {/* Brand */}
      <Link to={roleLabel === 'owner' ? '/owner' : '/admin'} className="px-5 pt-3 pb-6 flex items-center justify-between">
        <Logo size="lg" />
        <span className="chip chip-primary !text-[10px]">{roleLabel}</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-none">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-5">
            {group.label && (
              <div className="eyebrow !text-ink-faint px-3 mb-2 mt-2 text-[10px]">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== '/owner' && item.to !== '/admin' && pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/owner' || item.to === '/admin'}
                      className={cn('nav-item group', isActive && 'is-active')}
                    >
                      <Icon
                        size={18}
                        strokeWidth={2}
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive ? 'text-primary' : 'text-ink-faint group-hover:text-ink'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/20 text-[#8A5C00]">
                          {item.badge}
                        </span>
                      )}
                      {!item.badge && isActive && (
                        <ChevronRight size={14} className="ml-auto text-accent shrink-0" />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Help card */}
      <div className="p-3">
        <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 border border-line p-4">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-primary text-ink-inverse">
              <LifeBuoy size={15} />
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-ink">Need a hand?</div>
              <p className="text-[12px] text-ink-muted mt-0.5 leading-snug">
                Search docs or talk to the team.
              </p>
              <button className="mt-2 text-[12px] font-semibold text-primary hover:text-primary-700 transition-colors">
                Open help centre →
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
