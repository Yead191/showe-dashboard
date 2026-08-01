import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GBP = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 2,
});

const GBP_NO_DECIMAL = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

/** Format pence (e.g. 4990) → "£49.90". */
export function formatPence(pence: number, opts?: { compact?: boolean }) {
  if (opts?.compact && Number.isInteger(pence / 100)) {
    return GBP_NO_DECIMAL.format(pence / 100);
  }
  return GBP.format(pence / 100);
}

/** Format pounds (already a pound number) — for already-converted values. */
export function formatGBP(value: number, opts?: { compact?: boolean }) {
  if (opts?.compact && value >= 1000) {
    if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`;
    return `£${(value / 1000).toFixed(1)}k`;
  }
  return GBP.format(value);
}

/** Plain integer: 12450 → "12,450". */
export function formatNumber(value: number, compact = false) {
  if (compact) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('en-GB').format(value);
}

/** "+12.4%" / "-2.3%" — sign-aware. */
export function formatDelta(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/** Friendly relative time from now. */
export function timeAgo(iso: string | undefined | null) {
  if (!iso) return 'never';
  const thenDate = new Date(iso);
  if (isNaN(thenDate.getTime())) return 'never';

  const now = Date.now();
  const then = thenDate.getTime();
  const sec = Math.floor((now - then) / 1000);
  if (isNaN(sec)) return 'never';
  if (sec < 0) return 'just now';
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)} d ago`;
  if (sec < 86400 * 30) return `${Math.floor(sec / (86400 * 7))} wk ago`;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(thenDate);
}

/** "Sat, 12 May 2026" */
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

/** "12 May" */
export function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso));
}

/** "12 May 2026, 19:30" */
export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** "19:30" — display a "HH:mm" string nicely. */
export function formatTime(time: string) {
  return time;
}

/** Convert seconds to human dwell ("2m 22s"). */
export function formatDwell(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

/** Initials for avatars. */
export function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Capitalize first letter. */
export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Title case from snake_case / kebab-case. */
export function titleCase(s: string) {
  return s
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(capitalize)
    .join(' ');
}
