import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole;
}

/** Requires authentication; optionally a specific role. */
export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'super_admin' ? '/admin' : '/owner'} replace />;
  }
  return <>{children}</>;
}

/** Public-only routes (login etc) — redirects authed users away. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'super_admin' ? '/admin' : '/owner'} replace />;
  }
  return <>{children}</>;
}
