import { baseApi } from "@/store/api/baseApi";
import { clearToken } from "@/store/slices/authSlice";
import { useAuthStore } from "@/store/auth.store";
import type { AppDispatch } from "@/store";

/**
 * Clears local session, Redux auth token, and all RTK Query cache.
 * Call on explicit logout and session expiry so the next login
 * cannot reuse the previous account's cached data.
 */
export function clearAuthSession(dispatch: AppDispatch) {
  try {
    localStorage.removeItem("token");
  } catch {
    // Ignore storage access issues.
  }

  useAuthStore.setState({ user: null, isAuthenticated: false });
  dispatch(clearToken());
  dispatch(baseApi.util.resetApiState());
}
