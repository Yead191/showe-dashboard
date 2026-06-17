export type RecommendationType = 'restaurants' | 'hotels' | 'bars';

export interface Recommendation {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  distance: string;
  price: string;
  location: string;
  total_clicks: number;
  url?: string;
  description?: string;
}

export const MOCK_RECOMMENDATION: {
  nearby_restaurants: Recommendation[];
  nearby_hotels: Recommendation[];
  nearby_bars: Recommendation[];
} = {
  nearby_restaurants: [
    {
      id: 'res_1',
      name: 'The Gilded Fork',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800',
      category: 'Fine Dining',
      rating: 4.8,
      distance: '0.2 mi',
      price: '£££',
      location: '12 Regent Street, London W1B 5TR',
      total_clicks: 124,
      url: 'https://gildedfork.com/',
      description: 'Elegant fine-dining experience with a seasonal British tasting menu, just steps from the venue.',
    },
    {
      id: 'res_2',
      name: 'Spice Route',
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800',
      category: 'Asian Fusion',
      rating: 4.6,
      distance: '0.5 mi',
      price: '££',
      location: '45 Berwick Street, Soho, London W1F 8SE',
      total_clicks: 98,
      url: 'https://spiceroute.example.com',
      description: 'Vibrant pan-Asian small plates with an extensive cocktail list. Pre-theatre menu available.',
    },
  ],
  nearby_hotels: [
    {
      id: 'hot_1',
      name: 'Grand Horizon Hotel',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
      category: 'Luxury',
      rating: 4.9,
      distance: '0.4 mi',
      price: '££££',
      location: '1 Park Lane, Mayfair, London W1K 1QA',
      total_clicks: 211,
      url: 'https://grandhorizon.example.com',
      description: 'Five-star luxury hotel with rooftop spa and chauffeur service to the venue.',
    },
    {
      id: 'hot_2',
      name: 'The Urban Suite',
      image: 'https://www.panpacific.com/content/dam/pphg-revamp/en/prsps/prc-2-0/stay/urban-suite/PRSPS_UrbanSuite_About_Room_Image.jpg',
      category: 'Boutique',
      rating: 4.7,
      distance: '1.2 mi',
      price: '£££',
      location: '88 Great Eastern Street, Shoreditch, London EC2A 3JF',
      total_clicks: 156,
      url: 'https://theurbansuite.example.com',
      description: 'Design-led boutique suites in the heart of Shoreditch with personalised concierge.',
    },
    {
      id: 'hot_3',
      name: 'Azure Bay Resort',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000',
      category: 'Resort',
      rating: 4.8,
      distance: '2.5 mi',
      price: '££££',
      location: '3 Bayside Drive, Canary Wharf, London E14 5AB',
      total_clicks: 173,
      url: 'https://azurebayresort.example.com',
      description: 'Waterfront resort with full-service spa, multiple restaurants and panoramic skyline views.',
    },
  ],
  nearby_bars: [
    {
      id: 'bar_1',
      name: 'The Velvet Lounge',
      image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=800',
      category: 'Cocktail Bar',
      rating: 4.8,
      distance: '0.1 mi',
      price: '££',
      location: '23 Dean Street, Soho, London W1D 3RP',
      total_clicks: 189,
      url: 'https://velvetlounge.example.com',
      description: 'Speakeasy-style cocktail bar with live jazz on weekends and an award-winning bartender.',
    },
    {
      id: 'bar_2',
      name: 'Neon Nights',
      image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1000',
      category: 'Pub',
      rating: 4.5,
      distance: '0.3 mi',
      price: '££',
      location: '7 Brick Lane, Spitalfields, London E1 6PU',
      total_clicks: 134,
      url: 'https://neonnights.example.com',
      description: 'Lively neighbourhood pub with craft beer on rotation, late-night kitchen and street-art vibes.',
    },
    {
      id: 'bar_3',
      name: 'Craft & Cask',
      image: 'https://static.where-e.com/United_Kingdom/Cask-Craft-Bar-Bottle-Shop_70a0692d6ce67d0f307c964c4c06fc84.jpg',
      category: 'Brewery',
      rating: 4.6,
      distance: '0.6 mi',
      price: '££',
      location: '60 Bermondsey Street, London SE1 3UD',
      total_clicks: 111,
      url: 'https://craftandcask.example.com',
      description: 'Independent micro-brewery and taproom serving small-batch beers paired with sharing boards.',
    },
  ],
};
