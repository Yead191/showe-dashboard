import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { LogOut, Settings, ChevronDown, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui';
import { TIER_META } from '@/constants/tiers';

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return null;

  const isAdmin = user.role === 'super_admin';
  const tierMeta = !isAdmin && user.tier ? TIER_META[user.tier] : null;

  const items: MenuProps['items'] = [
    {
      key: 'profile-header',
      label: (
        <div className="px-1 py-2 -mx-1">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar_url} name={user.name} size={40} />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-ink truncate max-w-[180px]">
                {user.name}
              </div>
              <div className="text-[11px] text-ink-faint truncate max-w-[180px]">
                {user.email}
              </div>
            </div>
          </div>
          {tierMeta && (
            <div
              className="mt-3 px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-semibold"
              style={{
                background: `${tierMeta.color}12`,
                color: tierMeta.color,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: tierMeta.color }}
              />
              {tierMeta.label}
              <span className="ml-auto text-[10px] opacity-70">{tierMeta.modules.length} modules</span>
            </div>
          )}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'settings',
      label: (
        <span className="flex items-center gap-2.5">
          <Settings size={14} className="text-ink-faint" />
          Settings
        </span>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <span className="flex items-center gap-2.5 text-danger">
          <LogOut size={14} />
          Sign out
        </span>
      ),
      danger: true,
    },
  ].filter(Boolean) as MenuProps['items'];

  function onClick({ key }: { key: string }) {
    if (key === 'logout') {
      logout();
      navigate('/login', { replace: true });
    } else if (key === 'profile') {
      navigate(isAdmin ? '/admin/settings' : '/owner/profile');
    } else if (key === 'settings') {
      navigate(isAdmin ? '/admin/settings' : '/owner/settings');
    }
  }

  return (
    <Dropdown
      menu={{ items, onClick }}
      trigger={['click']}
      placement="bottomRight"
      overlayStyle={{ minWidth: 240 }}
    >
      <button className="inline-flex items-center gap-2 h-10 pl-1 pr-3 rounded-full bg-surface-raised border border-line hover:border-line-strong shadow-soft transition-all duration-200 ease-smooth hover:-translate-y-px">
        <Avatar src={user.avatar_url} name={user.name} size={32} />
        <div className="text-left hidden md:block leading-tight">
          <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold leading-none">
            {isAdmin ? 'Super admin' : 'Venue owner'}
          </div>
          <div className="text-[13px] font-semibold text-ink mt-0.5 max-w-[140px] truncate">
            {user.name}
          </div>
        </div>
        <ChevronDown size={14} className="text-ink-faint" />
      </button>
    </Dropdown>
  );
}
