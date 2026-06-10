import { memo } from 'react';
import { Search } from 'lucide-react';
import { Input } from 'antd';
import { cn } from '@/lib/utils';
import type { ProgrammeDocStatus } from '@/types/programme';

const FILTER_TABS: { v: 'all' | ProgrammeDocStatus; label: string }[] = [
  { v: 'all', label: 'All' },
  { v: 'draft', label: 'Drafts' },
  { v: 'published', label: 'Published' },
  { v: 'archived', label: 'Archived' },
];

interface FilterBarProps {
  filter: 'all' | ProgrammeDocStatus;
  setFilter: (filter: 'all' | ProgrammeDocStatus) => void;
  search: string;
  setSearch: (search: string) => void;
  counts: { all: number; draft: number; published: number; archived: number };
}

export const FilterBar = memo(function FilterBar({
  filter,
  setFilter,
  search,
  setSearch,
  counts,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-surface-sunken border border-line">
        {FILTER_TABS.map((t) => (
          <button
            key={t.v}
            onClick={() => setFilter(t.v)}
            className={cn(
              'h-8 px-3.5 rounded-full text-[12.5px] font-semibold transition-all whitespace-nowrap',
              filter === t.v ? 'bg-primary text-ink-inverse shadow-soft' : 'text-ink-muted hover:text-ink'
            )}
          >
            {t.label}
            <span
              className={cn(
                'ml-1.5 text-[10.5px] tabular',
                filter === t.v ? 'text-accent-300' : 'text-ink-faint'
              )}
            >
              {counts[t.v]}
            </span>
          </button>
        ))}
      </div>
      <Input
        allowClear
        prefix={<Search size={13} className="text-ink-faint" />}
        placeholder="Search programmes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 260 }}
      />
    </div>
  );
});