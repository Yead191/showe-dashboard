import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { LogOut, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useGetProfileQuery, type UserProfile } from "@/store/api/authApi";
import { Avatar } from "@/components/ui";
import { getImageUrl } from "@/helpers/getImageUrl";
import { TIER_META } from "@/constants/tiers";

interface UserMenuProps {
  profile?: UserProfile;
}

export function UserMenu({ profile }: UserMenuProps) {
  const { data: user } = useGetProfileQuery();

  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  console.log(user);
  if (!user) return null;

  const isAdmin = user.role === "super_admin";
  const displayName = profile?.name ?? user.name;
  const displayEmail = profile?.email ?? user.email;
  const avatarSrc = profile?.image?.trim()
    ? getImageUrl(profile.image.trim())
    : "";

  const items: MenuProps["items"] = [
    {
      key: "profile-header",
      label: (
        <div className="px-1 py-2 -mx-1">
          <div className="flex items-center gap-3">
            <Avatar src={avatarSrc} name={displayName} size={40} />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-ink truncate  max-w-[180px]">
                {displayName}
              </div>
              <div className="text-[11px] text-ink-faint truncate max-w-[180px]">
                {displayEmail}
              </div>
            </div>
          </div>
          {user?.subscription && (
            <div
              className="mt-3 px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-semibold"
              style={{
                background: `#E9EDEC`,
                color: "#014B52",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "#014B52" }}
              />
              {user?.subscription?.name}
              <span className="ml-auto text-[10px] opacity-70">
                {user?.subscription?.modules?.length} modules
              </span>
            </div>
          )}
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "settings",
      label: (
        <span className="flex items-center gap-2.5">
          <Settings size={14} className="text-ink-faint" />
          Settings
        </span>
      ),
    },
    { type: "divider" },
    {
      key: "logout",
      label: (
        <span className="flex items-center gap-2.5 text-danger">
          <LogOut size={14} />
          Sign out
        </span>
      ),
      danger: true,
    },
  ].filter(Boolean) as MenuProps["items"];

  function onClick({ key }: { key: string }) {
    if (key === "logout") {
      logout();
      navigate("/login", { replace: true });
    } else if (key === "profile") {
      navigate(isAdmin ? "/admin/settings" : "/owner/profile");
    } else if (key === "settings") {
      navigate(isAdmin ? "/admin/settings" : "/owner/settings");
    }
  }

  return (
    <Dropdown
      menu={{ items, onClick }}
      trigger={["click"]}
      placement="bottomRight"
      overlayStyle={{ minWidth: 240 }}
    >
      <button className="inline-flex items-center gap-2 h-10 pl-1 pr-3 rounded-full bg-surface-raised border border-line hover:border-line-strong shadow-soft transition-all duration-200 ease-smooth hover:-translate-y-px">
        <Avatar src={avatarSrc} name={displayName} size={32} />
        <div className="text-left hidden md:block leading-tight">
          <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold leading-none">
            {isAdmin ? "Super admin" : "Organisation"}
          </div>
          <div className="text-[13px] font-semibold text-ink mt-0.5 max-w-[140px] truncate">
            {displayName}
          </div>
        </div>
        <ChevronDown size={14} className="text-ink-faint" />
      </button>
    </Dropdown>
  );
}
