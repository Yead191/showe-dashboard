import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';
import { VENUE_OWNER_NAV, SUPER_ADMIN_NAV } from '@/constants/navigation';
import { useGetProfileQuery } from '@/store/api/authApi';

export function DashboardLayout() {
  const { pathname } = useLocation();
  const { data: profile } = useGetProfileQuery();

  // Prefer API profile role (not the mock zustand user). While profile is
  // loading after login, fall back to the current path prefix.
  const isAdmin =
    profile?.role === 'SUPER_ADMIN' ||
    (!profile && pathname.startsWith('/admin'));

  const groups = isAdmin ? SUPER_ADMIN_NAV : VENUE_OWNER_NAV;
  const roleLabel = isAdmin ? 'Admin' : 'Organisation';

  return (
    <div className="flex min-h-dvh">
      <Sidebar groups={groups} roleLabel={roleLabel} homePath={isAdmin ? '/admin' : '/owner'} />
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
