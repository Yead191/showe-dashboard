export interface Ad {
  id: string;
  title: string;
  imageUrl?: string;
  redirectUrl: string;
  startDate: string;   // "YYYY-MM-DD"
  endDate: string;     // "YYYY-MM-DD"
  active: boolean;
  impressions: number;
  clicks: number;
  views: number;
  revenue: number;
}

export const INITIAL_ADS: Ad[] = [
  {
    id: 'ad_1',
    title: 'The Gilded Fork – Summer Menu',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    redirectUrl: 'https://giledfork.co.uk/summer',
    startDate: '2026-05-01',
    endDate: '2026-07-31',
    active: true,
    impressions: 4280,
    clicks: 312,
    views: 3940,
    revenue: 480,
  },
  {
    id: 'ad_2',
    title: 'Bath Spa Hotel – Weekend Breaks',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe2f5?w=400&q=80',
    redirectUrl: 'https://bathspahotel.com/breaks',
    startDate: '2026-04-15',
    endDate: '2026-08-15',
    active: true,
    impressions: 1820,
    clicks: 92,
    views: 1640,
    revenue: 220,
  },
  {
    id: 'ad_3',
    title: 'Harlem Coffee Co. – Opening Soon',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    redirectUrl: 'https://harlemcoffee.com',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    active: false,
    impressions: 940,
    clicks: 48,
    views: 870,
    revenue: 90,
  },
  {
    id: 'ad_4',
    title: 'Meridian Watches – New Collection',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80',
    redirectUrl: 'https://meridianwatches.co.uk',
    startDate: '2026-05-10',
    endDate: '2026-06-30',
    active: true,
    impressions: 3100,
    clicks: 278,
    views: 2850,
    revenue: 350,
  },
  {
    id: 'ad_5',
    title: 'Artisan Gin Bar – Cocktail Night',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80',
    redirectUrl: 'https://artisanginbar.com/events',
    startDate: '2026-05-20',
    endDate: '2026-07-01',
    active: false,
    impressions: 620,
    clicks: 31,
    views: 580,
    revenue: 60,
  },
];
