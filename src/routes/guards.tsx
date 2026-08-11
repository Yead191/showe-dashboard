import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/auth";
import { useGetProfileQuery } from "@/store/api/authApi";

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

function homePathForRole(role: string | undefined): "/admin" | "/owner" {
  console.log(role);
  return role === "SUPER_ADMIN" ? "/admin" : "/owner";
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSession = hasAuthToken() || isAuthenticated;

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: !hasSession,
  });

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || (!profile && !isError)) {
    return <AuthBootSpinner />;
  }

  if (isError || !profile) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={homePathForRole(profile.role)} replace />;
}

/** Requires authentication; optionally a specific role. */
export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSession = hasAuthToken() || isAuthenticated;

  const {
    data: user,
    isLoading,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: !hasSession,
  });

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

  if (role && user.role !== role) {
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSession = hasAuthToken() && isAuthenticated;

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetProfileQuery(undefined, {
    skip: !hasSession,
  });

  if (!hasSession) {
    return <>{children}</>;
  }

  if (isLoading || (!profile && !isError)) {
    return <AuthBootSpinner />;
  }

  if (isError || !profile) {
    return <>{children}</>;
  }

  return <Navigate to={homePathForRole(profile.role)} replace />;
}
