import type { VenueTier, OrgType } from '@/types/auth';

export interface TierMeta {
  label: string;
  short: string;
  audience: string;
  modules: number[];
  can_charge: boolean;
  description: string;
  color: string; // tailwind hex
  priceMonthly: number;
  features: string[];
  recommended?: boolean;
}

export const TIER_META: Record<VenueTier, TierMeta> = {
  tier_1: {
    label: 'Foundation',
    short: 'T1',
    audience: 'Schools, colleges & amateur dramatic clubs',
    modules: [1, 2, 3, 4],
    can_charge: true,
    description: 'Foundation modules. Programmes free by default; optional paid programmes at £2 minimum.',
    color: '#7A39BB',
    priceMonthly: 0,
    features: [
      "Digital programme creation",
      "Basic event scheduling",
      "QR distribution",
      "Standard support",
    ],
  },
  tier_1_plus: {
    label: 'Presence',
    short: 'T1+',
    audience: 'Venues',
    modules: [1, 2, 3, 4, 10],
    can_charge: false,
    description: 'Establish your venue\'s digital footprint. Foundation plus location utilities.',
    color: '#006494',
    priceMonthly: 40,
    features: [
      "Digital programme creation",
      "Basic event scheduling",
      "QR distribution",
      "Brand customisation",
      "Standard support",
    ],
  },
  tier_2: {
    label: 'Engage',
    short: 'T2',
    audience: 'Venues',
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 10],
    can_charge: false,
    description: 'Deeper audience connection & insights. Engagement, purchasing, and recommendations.',
    color: '#01696F',
    priceMonthly: 75,
    recommended: true,
    features: [
      "Everything in Presence",
      "Audience analytics",
      "Cross-promotion blocks",
      "Sponsorship modules",
      "Multi-language support",
      "Priority support",
    ],
  },
  tier_3: {
    label: 'Amplify',
    short: 'T3',
    audience: 'Venues',
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    can_charge: false,
    description: 'Maximum reach with the full toolset. All modules including push notifications.',
    color: '#014B52',
    priceMonthly: 150,
    features: [
      "Everything in Engage",
      "Advanced distribution network",
      "Custom integrations",
      "Dedicated account manager",
      "White-label options",
      "API access",
    ],
  },
  tier_3_plus: {
    label: 'Producers',
    short: 'T3+',
    audience: 'Producers',
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    can_charge: true,
    description: 'All modules with commission-based sales. £2 minimum, 10% SHOWE commission.',
    color: '#DA7101',
    priceMonthly: 200,
    features: [
      "All premium modules",
      "Commission-based sales",
      "White-label options",
      "API access",
      "Priority engineering support",
    ],
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
