import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, UserRole } from "@/types/auth";
import { mockAuthUsers, DEMO_CREDS } from "@/constants/auth";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  // selected role tab on login screen
  loginRole: UserRole;
  setLoginRole: (role: UserRole) => void;
  login: (
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  // venue switcher
  setActiveVenueId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loginRole: "ORGANIZATION",
      setLoginRole: (role) => set({ loginRole: role }),

      login: async (email, password, role) => {
        // Simulate latency
        await new Promise((r) => setTimeout(r, 700));

        const expected =
          role === "SUPER_ADMIN"
            ? DEMO_CREDS.super_admin
            : DEMO_CREDS.venue_owner;
        if (
          email.trim().toLowerCase() !== expected.email ||
          password !== expected.password
        ) {
          return { ok: false, error: "Email or password is incorrect." };
        }
        const user =
          role === "SUPER_ADMIN"
            ? mockAuthUsers.super_admin
            : mockAuthUsers.venue_owner;
        set({ user, isAuthenticated: true });
        return { ok: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        try {
          localStorage.removeItem("token");
        } catch {
          /* no-op */
        }
      },

      setActiveVenueId: (id) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, active_venue_id: id } });
      },
    }),
    {
      name: "showe-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
);
