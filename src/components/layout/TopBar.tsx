import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import { VenueSwitcher } from './VenueSwitcher';
import { TopbarNotifications } from './TopbarNotifications';
import { UserMenu } from './UserMenu';
import { SearchSuggestions } from './SearchSuggestions';

import { useAuthStore } from '@/store/auth.store';
import { useGetProfileQuery } from '@/store/api/authApi';
import { SUPER_ADMIN_NAV, VENUE_OWNER_NAV } from '@/constants';

export function TopBar() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: profile } = useGetProfileQuery(undefined, { skip: !isAuthenticated });

  // Search Context States
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten active navigation matrices on mounting/role variations
  const searchableItems = useMemo(() => {
    const activeNavConfig = role === 'super_admin' ? SUPER_ADMIN_NAV : VENUE_OWNER_NAV;
    return activeNavConfig.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        category: group.label || 'General',
      }))
    );
  }, [role]);

  // Perform dynamic keyword match calculations
  const filteredResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return searchableItems;

    return searchableItems.filter(
      (item) =>
        item.label.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery)
    );
  }, [query, searchableItems]);

  // Handle routing selections safely
  const handleRouting = useCallback((targetUrl: string) => {
    navigate(targetUrl);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  }, [navigate]);

  // Reset visual index mapping on query alterations
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global browser listeners (Hotkey registration + blur clicks)
  useEffect(() => {
    const handleGlobalHotkeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    const handleOutsideInteractions = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalHotkeys);
    document.addEventListener('mousedown', handleOutsideInteractions);
    return () => {
      window.removeEventListener('keydown', handleGlobalHotkeys);
      document.removeEventListener('mousedown', handleOutsideInteractions);
    };
  }, []);

  // Structural input element navigation keyboard capturing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
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
        {role === 'venue_owner' && <VenueSwitcher />}
        {role === 'super_admin' && (
          <div className="inline-flex items-center gap-2 h-10 px-3 rounded-full bg-primary text-ink-inverse shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            <span className="text-[12px] font-semibold uppercase tracking-wider">Platform admin</span>
          </div>
        )}

        {/* Input Wrapper Shell */}
        <div ref={containerRef} className="flex-1 hidden md:flex items-center justify-center relative">
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
                role === 'super_admin'
                  ? 'Search venues, users, payments…'
                  : 'Search programmes, events, refunds…'
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
          <TopbarNotifications userId={profile?._id} />
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}