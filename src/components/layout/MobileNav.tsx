import { NavLink, useLocation } from 'react-router-dom';
import type { NavGroup } from '@/constants/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Drawer } from 'antd';
import { Logo } from '@/components/ui';

interface MobileNavProps {
  groups: NavGroup[];
}

export function MobileNav({ groups }: MobileNavProps) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const flatItems = groups.flatMap((g) => g.items).slice(0, 4);

  return (
    <>
      <nav className="lg:hidden fixed bottom-3 inset-x-3 z-40 flex items-center gap-1 p-1.5 rounded-full bg-surface-raised border border-line shadow-large">
        {flatItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.to ||
            (item.to !== '/owner' && item.to !== '/admin' && pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/owner' || item.to === '/admin'}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-full transition-colors',
                isActive ? 'bg-primary text-ink-inverse' : 'text-ink-muted'
              )}
            >
              <Icon size={17} />
              <span className="text-[10px] font-semibold">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 text-ink-muted"
        >
          <Menu size={17} />
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>

      <Drawer
        title={<Logo size="sm" />}
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        width={300}
      >
        {groups.map((group, gi) => (
          <div key={gi} className="mb-5">
            {group.label && <div className="eyebrow !text-ink-faint mb-2">{group.label}</div>}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.to ||
                  (item.to !== '/owner' && item.to !== '/admin' && pathname.startsWith(item.to));
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setOpen(false)}
                      end={item.to === '/owner' || item.to === '/admin'}
                      className={cn('nav-item', isActive && 'is-active')}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </Drawer>
    </>
  );
}
