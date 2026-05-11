import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Building2,
  Calendar,
  BookOpen,
  BarChart3,
  CreditCard,
  Users,
  Megaphone,
  Bell,
  MapPinned,
  Settings,
  Cog,
  Banknote,
  Palette,
  Layers,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
  group?: string;
  disabled?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const VENUE_OWNER_NAV: NavGroup[] = [
  {
    items: [
      { label: 'Overview', to: '/owner', icon: LayoutGrid },
      { label: 'Venues', to: '/owner/venues', icon: Building2 },
    ],
  },
  {
    label: 'Programming',
    items: [
      { label: 'Events', to: '/owner/events', icon: Calendar },
      { label: 'Programmes', to: '/owner/programmes', icon: BookOpen, badge: 'New' },
      // { label: 'Refunds', to: '/owner/refunds', icon: RefreshCcw },
    ],
  },
  {
    label: 'Insight',
    items: [
      { label: 'Analytics', to: '/owner/analytics', icon: BarChart3 },
      { label: 'Ads', to: '/owner/promotions', icon: Megaphone },
      { label: 'Push notifications', to: '/owner/notifications', icon: Bell },
      { label: 'Recommendations', to: '/owner/recommendations', icon: MapPinned },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Subscription', to: '/owner/subscription', icon: CreditCard },
      // { label: 'Profile', to: '/owner/profile', icon: Sparkles },
      { label: 'Settings', to: '/owner/settings', icon: Settings },
    ],
  },
];

export const SUPER_ADMIN_NAV: NavGroup[] = [
  {
    items: [
      { label: 'Overview', to: '/admin', icon: LayoutGrid },
    ],
  },
  {
    label: 'Network',
    items: [
      { label: 'Venues', to: '/admin/venues', icon: Building2 },
      { label: 'Users', to: '/admin/users', icon: Users },
      { label: 'Subscriptions', to: '/admin/subscriptions', icon: CreditCard },
    ],
  },
  {
    label: 'Money',
    items: [
      { label: 'Payments', to: '/admin/payments', icon: Banknote },
      // { label: 'Refunds', to: '/admin/refunds', icon: RefreshCcw },
    ],
  },
  {
    label: 'Insight',
    items: [
      { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
      // { label: 'Reports', to: '/admin/reports', icon: FileBarChart2 },
      // { label: 'Moderation', to: '/admin/moderation', icon: ShieldCheck },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Tiers & modules', to: '/admin/tiers', icon: Layers },
      { label: 'Customisation', to: '/admin/customisation', icon: Palette },
      // { label: 'Search prominence', to: '/admin/search-prominence', icon: Search },
      { label: 'Settings', to: '/admin/settings', icon: Cog },
    ],
  },
];
