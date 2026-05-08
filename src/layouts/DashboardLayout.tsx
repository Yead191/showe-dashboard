import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';
import { VENUE_OWNER_NAV, SUPER_ADMIN_NAV } from '@/constants/navigation';

export function DashboardLayout() {
  const role = useAuthStore((s) => s.user?.role);
  const groups = role === 'super_admin' ? SUPER_ADMIN_NAV : VENUE_OWNER_NAV;
  const roleLabel = role === 'super_admin' ? 'Admin' : 'Owner';

  return (
    <div className="flex min-h-dvh">
      <Sidebar groups={groups} roleLabel={roleLabel} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 px-5 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-12">
          <div className=" animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav groups={groups} />
    </div>
  );
}
