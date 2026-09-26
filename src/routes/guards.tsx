import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/auth";
import { useGetProfileQuery } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { clearAuthSession, clearAuthCookies } from "@/lib/clear-auth-session";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole;
}

function hasAuthToken(): boolean {
  try {
    return Boolean(
      typeof localStorage !== "undefined" && localStorage.getItem("token"),
    );
  } catch {
    return false;
  }
}

/**
 * Validates whether the role has permission to access the dashboard.
 * Only "ORGANISER" (including aliases "ORGANIZATION", "ORGANIZER") and "SUPER_ADMIN" are allowed.
 */
export function isAllowedRole(role?: string | null): boolean {
  if (!role) return false;
  const upper = role.toUpperCase();
  return (
    upper === "SUPER_ADMIN" ||
    upper === "ORGANISER" ||
    upper === "ORGANIZER" ||
    upper === "ORGANIZATION"
  );
}

function roleMatches(
  userRole: string | undefined,
  requiredRole: UserRole | undefined,
): boolean {
  if (!requiredRole) return true;
  if (!userRole) return false;
  const u = userRole.toUpperCase();
  if (requiredRole === "SUPER_ADMIN") {
    return u === "SUPER_ADMIN";
  }
  if (requiredRole === "ORGANIZATION") {
    return u === "ORGANIZATION" || u === "ORGANISER" || u === "ORGANIZER";
  }
  return false;
}

function homePathForRole(role: string | undefined): "/admin" | "/owner" {
  return role?.toUpperCase() === "SUPER_ADMIN" ? "/admin" : "/owner";
}

function AuthBootSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <Spin size="large" />
    </div>
  );
}

/** `/` — send signed-in users to the correct area based on API profile role. */
export function RootRedirect() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSession = hasAuthToken() || isAuthenticated;

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: !hasSession,
  });

  const isUnauthorizedRole = Boolean(profile && !isAllowedRole(profile.role));

  useEffect(() => {
    if (isUnauthorizedRole) {
      clearAuthSession(dispatch);
      toast.error("Access denied. Only organisers and administrators can access the dashboard.");
    }
  }, [isUnauthorizedRole, dispatch]);

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || (!profile && !isError)) {
    return <AuthBootSpinner />;
  }

  if (isError || !profile || isUnauthorizedRole) {
    if (isUnauthorizedRole) {
      clearAuthCookies();
      try {
        localStorage.removeItem("token");
      } catch {}
    }
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={homePathForRole(profile.role)} replace />;
}

/** Requires authentication; optionally a specific role. */
export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSession = hasAuthToken() || isAuthenticated;

  const {
    data: user,
    isLoading,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: !hasSession,
  });

  const isUnauthorizedRole = Boolean(user && !isAllowedRole(user.role));

  useEffect(() => {
    if (isUnauthorizedRole) {
      clearAuthSession(dispatch);
      toast.error("Access denied. Only organisers and administrators can access the dashboard.");
    }
  }, [isUnauthorizedRole, dispatch]);

  if (!hasSession) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Wait for profile before deciding — redirecting while loading bounces
  // with PublicOnlyRoute and causes "Maximum update depth exceeded".
  if (isLoading || (!user && !isError)) {
    return <AuthBootSpinner />;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isUnauthorizedRole) {
    clearAuthCookies();
    try {
      localStorage.removeItem("token");
    } catch {}
    return <Navigate to="/login" replace />;
  }

  if (role && !roleMatches(user.role, role)) {
    const dest = homePathForRole(user.role);
    if (location.pathname.startsWith(dest)) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
}

/** Public-only routes (login etc) — redirects authed users away. */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSession = hasAuthToken() && isAuthenticated;

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: !hasSession,
  });

  const isUnauthorizedRole = Boolean(profile && !isAllowedRole(profile.role));

  useEffect(() => {
    if (isUnauthorizedRole) {
      clearAuthSession(dispatch);
    }
  }, [isUnauthorizedRole, dispatch]);

  if (!hasSession) {
    return <>{children}</>;
  }

  if (isLoading || (!profile && !isError)) {
    return <AuthBootSpinner />;
  }

  if (isError || !profile || isUnauthorizedRole) {
    if (isUnauthorizedRole) {
      clearAuthCookies();
      try {
        localStorage.removeItem("token");
      } catch {}
    }
    return <>{children}</>;
  }

  return <Navigate to={homePathForRole(profile.role)} replace />;
}
