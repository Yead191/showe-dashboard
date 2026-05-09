export interface Sponsor {
  id: string;
  name: string;
  slot: string;
  impressions: number;
  clicks: number;
  revenue: number;
  status: 'active' | 'pending' | 'suspended';
}

export const INITIAL_SPONSORS: Sponsor[] = [
  {
    id: 'spo_1',
    name: 'The Gilded Fork',
    slot: 'Cover sponsor · Hamlet',
    impressions: 4280,
    clicks: 312,
    revenue: 480,
    status: 'active',
  },
  {
    id: 'spo_2',
    name: 'Bath Spa Hotel',
    slot: 'Footer · Midsummer',
    impressions: 1820,
    clicks: 92,
    revenue: 220,
    status: 'active',
  },
  {
    id: 'spo_3',
    name: 'Harlem Coffee',
    slot: 'Cast page · New Voices',
    impressions: 940,
    clicks: 48,
    revenue: 90,
    status: 'pending',
  },
];
