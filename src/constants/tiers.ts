import type { VenueTier, OrgType } from '@/types/auth';

export const TIER_META: Record<
  VenueTier,
  {
    label: string;
    short: string;
    audience: string;
    modules: number[];
    can_charge: boolean;
    description: string;
    color: string; // tailwind hex
  }
> = {
  tier_1: {
    label: 'Tier 1',
    short: 'T1',
    audience: 'Schools, colleges & amateur dramatic clubs',
    modules: [1, 2, 3, 4],
    can_charge: true, // option to sell at min £2
    description: 'Foundation modules. Programmes free by default; optional paid programmes at £2 minimum.',
    color: '#7A39BB',
  },
  tier_1_plus: {
    label: 'Tier 1+ Presence',
    short: 'T1+',
    audience: 'Venues',
    modules: [1, 2, 3, 4, 10],
    can_charge: false,
    description: 'Foundation plus location utilities. No programme fees.',
    color: '#006494',
  },
  tier_2: {
    label: 'Tier 2 Engage',
    short: 'T2',
    audience: 'Venues',
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 10],
    can_charge: false,
    description: 'Engagement, purchasing, memory capture and recommendations.',
    color: '#01696F',
  },
  tier_3: {
    label: 'Tier 3 Amplify',
    short: 'T3',
    audience: 'Venues',
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    can_charge: false,
    description: 'All modules including push notifications.',
    color: '#014B52',
  },
  tier_3_plus: {
    label: 'Tier 3+ Producers',
    short: 'T3+',
    audience: 'Producers',
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    can_charge: true,
    description: 'All modules. Programmes charged at £2 minimum, 10% SHOWE commission.',
    color: '#DA7101',
  },
};

export const ORG_TYPE_TO_TIER: Record<OrgType, VenueTier> = {
  school: 'tier_1',
  venue: 'tier_2', // default for venues — they can upgrade
  producer: 'tier_3_plus',
};

export const TIER_LIST: VenueTier[] = [
  'tier_1',
  'tier_1_plus',
  'tier_2',
  'tier_3',
  'tier_3_plus',
];
