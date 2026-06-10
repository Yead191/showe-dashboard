import type { VenueTier, OrgType } from '@/types/auth';

export interface TierMeta {
  label: string;
  short: string;
  audience: string;
  modules: number[];
  can_charge: boolean;
  description: string;
  color: string; // tailwind hex
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  recommended?: boolean;
  // Org limits & permissions
  maxVenues: number;      // 0 = unlimited
  maxProgrammes: number;  // 0 = unlimited
  canSell: boolean;       // can orgs on this tier sell programmes to audiences
  minProgrammePrice?: number;
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
    price: 0,
    billingPeriod: 'monthly',
    features: [
      "Digital programme creation",
      "Basic event scheduling",
      "QR distribution",
      "Standard support",
    ],
    maxVenues: 1,
    maxProgrammes: 5,
    canSell: true,
    minProgrammePrice: 2,
  },
  tier_1_plus: {
    label: 'Presence',
    short: 'T1+',
    audience: 'Venues',
    modules: [1, 2, 3, 4, 10],
    can_charge: false,
    description: 'Establish your venue\'s digital footprint. Foundation plus location utilities.',
    color: '#006494',
    price: 40,
    billingPeriod: 'monthly',
    features: [
      "Digital programme creation",
      "Basic event scheduling",
      "QR distribution",
      "Brand customisation",
      "Standard support",
    ],
    maxVenues: 2,
    maxProgrammes: 10,
    canSell: false,
    minProgrammePrice: 2,
  },
  tier_2: {
    label: 'Engage',
    short: 'T2',
    audience: 'Venues',
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 10],
    can_charge: false,
    description: 'Deeper audience connection & insights. Engagement, purchasing, and recommendations.',
    color: '#01696F',
    price: 75,
    billingPeriod: 'monthly',
    recommended: true,
    features: [
      "Everything in Presence",
      "Audience analytics",
      "Cross-promotion blocks",
      "Sponsorship modules",
      "Multi-language support",
      "Priority support",
    ],
    maxVenues: 5,
    maxProgrammes: 50,
    canSell: false,
    minProgrammePrice: 2,
  },
  tier_3: {
    label: 'Amplify',
    short: 'T3',
    audience: 'Venues',
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    can_charge: false,
    description: 'Maximum reach with the full toolset. All modules including push notifications.',
    color: '#014B52',
    price: 150,
    billingPeriod: 'monthly',
    features: [
      "Everything in Engage",
      "Advanced distribution network",
      "Custom integrations",
      "Dedicated account manager",
      "White-label options",
      "API access",
    ],
    maxVenues: 20,
    maxProgrammes: 0,
    canSell: true,
    minProgrammePrice: 2,
  },
  tier_3_plus: {
    label: 'Producers',
    short: 'T3+',
    audience: 'Producers',
    modules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    can_charge: true,
    description: 'All modules with commission-based sales. £2 minimum, 10% SHOWE commission.',
    color: '#DA7101',
    price: 200,
    billingPeriod: 'monthly',
    features: [
      "All premium modules",
      "Commission-based sales",
      "White-label options",
      "API access",
      "Priority engineering support",
    ],
    maxVenues: 0,
    maxProgrammes: 0,
    canSell: true,
    minProgrammePrice: 2,
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

export const MODULES_LIST = [
  { label: 'Module 1: Foundation', value: 1 },
  { label: 'Module 2: Events', value: 2 },
  { label: 'Module 3: QR Distribution', value: 3 },
  { label: 'Module 4: Brand Customisation', value: 4 },
  { label: 'Module 5: Analytics', value: 5 },
  { label: 'Module 6: Cross-promotion', value: 6 },
  { label: 'Module 7: Sponsorship', value: 7 },
  { label: 'Module 8: Multi-language', value: 8 },
  { label: 'Module 9: Push Notifications', value: 9 },
  { label: 'Module 10: Location Utilities', value: 10 },
];
