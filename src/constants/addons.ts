import type { VenueTier } from '@/types/auth';

export type AddOnStatus = 'live' | 'coming_soon' | 'archived';

export type AddOnAvailability = 'all' | VenueTier[];

/**
 * Stable feature key used by feature-gating code (e.g. hasCapability(user, 'push_notifications')).
 * Survives renames of labels and renumbering of modules. Add new keys here as add-ons evolve.
 */
export type CapabilityKey =
  | 'sponsored_listings'
  | 'push_notifications'
  | 'advanced_data_export';

export interface AddOn {
  id: string;
  label: string;
  short: string;
  description: string;
  bullets: string[];
  price: number;
  color: string;
  /** Lucide icon name — resolved in UI via a string→component map. */
  icon: string;
  /** If set, purchasing this add-on grants access to this tier module. */
  linkedModule?: number;
  /** Stable feature identifier — used by feature-gating code. */
  capabilityKey: CapabilityKey;
  status: AddOnStatus;
  /** Which tiers this add-on can be purchased on. 'all' = available everywhere. */
  availableOn: AddOnAvailability;
}

export const INITIAL_ADDONS: AddOn[] = [
  {
    id: 'addon_sponsored_listings',
    label: 'Sponsored Listings',
    short: 'SPN',
    description: "Earn extra income when you sell advertising to local businesses.",
    bullets: [
      "Recommendations on 'Plan Your Trip' page",
      "Highlight accommodation, pubs & restaurants",
      "Gather user behaviour data to prove boosted ROI to clients, increasing its value",
    ],
    price: 25,
    color: '#DA7101',
    icon: 'Megaphone',
    linkedModule: 7,
    capabilityKey: 'sponsored_listings',
    status: 'live',
    availableOn: 'all',
  },
  {
    id: 'addon_push_notifications',
    label: 'Push Notifications',
    short: 'PUSH',
    description: 'Send push notifications to your followers to keep them in the loop.',
    bullets: [
      'Send up to 20 notifications direct to phones',
      'Highlight and showcase events, changes and announcements',
      'Engage with users in a more meaningful, direct way',
    ],
    price: 25,
    color: '#01696F',
    icon: 'BellRing',
    linkedModule: 9,
    capabilityKey: 'push_notifications',
    status: 'live',
    availableOn: 'all',
  },
  {
    id: 'addon_advanced_data_export',
    label: 'Advanced Data Export',
    short: 'DATA',
    description: 'Gather in-depth data on users and behaviour.',
    bullets: [
      'Increased targeting for maximum effect',
      'Reduce wasted effort with user insights',
      'Integrate with your own tracking and marketing software',
    ],
    price: 15,
    color: '#7A39BB',
    icon: 'Database',
    capabilityKey: 'advanced_data_export',
    status: 'coming_soon',
    availableOn: 'all',
  },
];

export const ADDON_STATUS_META: Record<AddOnStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  live: { label: 'Live', tone: 'success' },
  coming_soon: { label: 'Coming Soon', tone: 'warning' },
  archived: { label: 'Archived', tone: 'neutral' },
};
