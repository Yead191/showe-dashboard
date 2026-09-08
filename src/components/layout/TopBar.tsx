import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CreditCard, ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { VenueSwitcher } from "./VenueSwitcher";
import { TopbarNotifications } from "./TopbarNotifications";
import { UserMenu } from "./UserMenu";
import { SearchSuggestions } from "./SearchSuggestions";
import {
  useGetProfileQuery,
  useCreateConnectedAccountMutation,
} from "@/store/api/authApi";
import { SUPER_ADMIN_NAV, VENUE_OWNER_NAV } from "@/constants";

export function TopBar() {
  const navigate = useNavigate();
  const { data: profile } = useGetProfileQuery();
  const [createConnectedAccount, { isLoading: isConnecting }] =
    useCreateConnectedAccountMutation();

  const isOrganizer =
    profile?.role === "ORGANIZER" || profile?.role === "ORGANIZATION";
  const isStripeConnected = Boolean(profile?.stripe_login_link?.trim());

  const handleConnectStripe = async () => {
    try {
      const res = await createConnectedAccount().unwrap();
      const redirectUrl =
        typeof res?.data === "string" ? res.data : res?.data?.data;

      if (redirectUrl) {
        toast.loading("Redirecting to Stripe...");
        window.location.href = redirectUrl;
      } else {
        toast.error("Stripe onboarding URL was not returned.");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to connect Stripe account",
      );
    }
  };

  // Search Context States
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten active navigation matrices on mounting/role variations
  const searchableItems = useMemo(() => {
    const activeNavConfig =
      profile?.role === "SUPER_ADMIN" ? SUPER_ADMIN_NAV : VENUE_OWNER_NAV;
    return activeNavConfig.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        category: group.label || "General",
      })),
    );
  }, [profile?.role]);

  // Perform dynamic keyword match calculations
  const filteredResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return searchableItems;

    return searchableItems.filter(
      (item) =>
        item.label.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery),
    );
  }, [query, searchableItems]);

  // Handle routing selections safely
  const handleRouting = useCallback(
    (targetUrl: string) => {
      navigate(targetUrl);
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    },
    [navigate],
  );

  // Reset visual index mapping on query alterations
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global browser listeners (Hotkey registration + blur clicks)
  useEffect(() => {
    const handleGlobalHotkeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    const handleOutsideInteractions = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleGlobalHotkeys);
    document.addEventListener("mousedown", handleOutsideInteractions);
    return () => {
      window.removeEventListener("keydown", handleGlobalHotkeys);
      document.removeEventListener("mousedown", handleOutsideInteractions);
    };
  }, []);

  // Structural input element navigation keyboard capturing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + filteredResults.length) % filteredResults.length,
      );
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleRouting(filteredResults[selectedIndex].to);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-surface-base/85 backdrop-blur-md border-b border-line/70 no-print">
      <div className="px-5 lg:px-8 h-16 flex items-center gap-3">
        {/* Left — Role Badge or Selector Toggle Context */}
        {(profile?.role === "ORGANIZATION" ||
          profile?.role === "ORGANIZER") && <VenueSwitcher />}
        {profile?.role === "SUPER_ADMIN" && (
          <div className="inline-flex items-center gap-2 h-10 px-3 rounded-full bg-primary text-ink-inverse shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            <span className="text-[12px] font-semibold uppercase tracking-wider">
              Platform admin
            </span>
          </div>
        )}

        {/* Input Wrapper Shell */}
        <div
          ref={containerRef}
          className="flex-1 hidden md:flex items-center justify-center relative"
        >
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={() => setIsOpen(true)}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                profile?.role === "SUPER_ADMIN"
                  ? "Search venues, users, payments…"
                  : "Search programmes, events, refunds…"
              }
              className="w-full h-10 pl-10 pr-12 rounded-full bg-surface-raised border border-line focus:border-primary focus:shadow-ring outline-none text-sm placeholder:text-ink-faint transition-all duration-200 ease-smooth"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-ink-faint bg-surface-sunken px-1.5 py-0.5 rounded border border-line pointer-events-none">
              ⌘ K
            </kbd>

            {/* Separated Component for Dropdown Suggestions */}
            <SearchSuggestions
              isOpen={isOpen}
              query={query}
              filteredResults={filteredResults}
              selectedIndex={selectedIndex}
              onSelect={handleRouting}
              setSelectedIndex={setSelectedIndex}
            />
          </div>
        </div>

        {/* Right Dashboard Profile Operations Grid */}
        <div className="ml-auto flex items-center gap-2.5 text-ink-muted">
          {/* Stripe Account Status / Connect Button for Organizers */}
          {isOrganizer &&
            (isStripeConnected ? (
              <a
                href={profile?.stripe_login_link!}
                target="_blank"
                rel="noopener noreferrer"
                title="Stripe account connected. Click to open Stripe Express Dashboard."
                className="inline-flex items-center gap-1.5 h-10 px-3 md:px-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 hover:bg-emerald-500/15 hover:border-emerald-500/30 text-xs font-semibold transition-all duration-200 ease-smooth shrink-0 group shadow-xs"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="hidden sm:inline">Stripe Connected</span>
                <span className="sm:hidden">Stripe</span>
                <ArrowUpRight
                  size={13}
                  className="text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150 shrink-0"
                />
              </a>
            ) : (
              <button
                type="button"
                onClick={handleConnectStripe}
                disabled={isConnecting}
                title="Connect your Stripe account"
                className="inline-flex items-center gap-1.5 md:gap-2 h-10 px-3.5 md:px-4 rounded-full bg-[#635BFF] hover:bg-[#5349e0] active:scale-[0.98] text-white text-xs font-semibold shadow-soft hover:shadow transition-all duration-200 ease-smooth disabled:opacity-60 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <Loader2 size={14} className="animate-spin shrink-0" />
                    <span>Connecting…</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={14} className="shrink-0" />
                    <span className="hidden sm:inline">Connect Stripe</span>
                    <span className="sm:hidden">Connect</span>
                  </>
                )}
              </button>
            ))}

          <TopbarNotifications userId={profile?._id} />
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
