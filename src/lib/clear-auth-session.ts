import { baseApi } from "@/store/api/baseApi";
import { clearToken } from "@/store/slices/authSlice";
import { useAuthStore } from "@/store/auth.store";
import type { AppDispatch } from "@/store";

/**
 * Clears authentication cookies across common names, paths, and subdomains.
 */
export function clearAuthCookies() {
  if (typeof document === "undefined") return;

  const cookieNames = [
    "token",
    "accessToken",
    "access_token",
    "refreshToken",
    "refresh_token",
    "jwt",
    "session",
    "auth",
  ];

  const hostname = window.location.hostname;
  const hostParts = hostname.split(".");
  const domains = ["", hostname, `.${hostname}`];

  if (hostParts.length > 2) {
    domains.push(`.${hostParts.slice(-2).join(".")}`);
  }

  const paths = ["/", "/login", ""];

  cookieNames.forEach((name) => {
    paths.forEach((path) => {
      domains.forEach((domain) => {
        const domainAttr = domain ? `domain=${domain};` : "";
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; ${domainAttr}`;
        document.cookie = `${name}=; max-age=0; path=${path}; ${domainAttr}`;
      });
    });
  });

  try {
    const rawCookies = document.cookie ? document.cookie.split(";") : [];
    for (const c of rawCookies) {
      const eqIdx = c.indexOf("=");
      const name = eqIdx > -1 ? c.substring(0, eqIdx).trim() : c.trim();
      if (name) {
        paths.forEach((path) => {
          domains.forEach((domain) => {
            const domainAttr = domain ? `domain=${domain};` : "";
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; ${domainAttr}`;
            document.cookie = `${name}=; max-age=0; path=${path}; ${domainAttr}`;
          });
        });
      }
    }
  } catch {
    // Ignore storage/cookie access issues.
  }
}

/**
 * Clears local session, Redux auth token, auth cookies, and all RTK Query cache.
 * Call on explicit logout and session expiry so the next login
 * cannot reuse the previous account's cached data.
 */
export function clearAuthSession(dispatch?: AppDispatch) {
  try {
    localStorage.removeItem("token");
  } catch {
    // Ignore storage access issues.
  }

  clearAuthCookies();

  useAuthStore.setState({ user: null, isAuthenticated: false });
  if (dispatch) {
    dispatch(clearToken());
    dispatch(baseApi.util.resetApiState());
  }
}

