export type EventStatus = 'draft' | 'published' | 'archived' | 'cancelled';
export type PerformanceType = 'matinee' | 'evening' | 'all_day';

export interface Performance {
  id: string;
  date: string; // ISO date
  start_time: string; // 24h "HH:mm"
  end_time: string;
  type: PerformanceType;
}

export interface EventLocation {
  venue_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  country: string;
  zip_code: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface EventHost {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
}

export interface EventListItem {
  id: string;
  venue_id: string;
  venue_name: string;
  title: string;
  slug: string;
  category: string;
  cover_image: string;
  status: EventStatus;
  is_featured: boolean;
  performances: Performance[]; // multiple shows possible
  location_city: string;
  programme_id?: string | null; // linked programme
  qr_scans: number;
  programme_downloads: number;
  revenue: number;
  created_at: string;
  updated_at: string;
}

export interface EventDetails extends EventListItem {
  tags: string[];
  gallery: string[];
  description_html: string;
  highlights: string[];
  get_tickets_url?: string;
  location: EventLocation;
  host: EventHost;
  social: {
    share_url: string;
    share_text: string;
    views_count: number;
  };
  nearby_restaurants?: NearbyPlace[];
  nearby_hotels?: NearbyPlace[];
  nearby_bars?: NearbyPlace[];
}

export interface NearbyPlace {
  id: string;
  name: string;
  image: string;
  category: string; // e.g. "Fine Dining" / "Boutique"
  rating: number;
  distance: string;
  price: string;
}
