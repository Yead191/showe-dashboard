import type { EventStatus, Performance } from '@/types/event';

export interface EventFormState {
  title: string;
  category: string;
  tags: string[];
  cover_image: string | File | null;
  gallery: (string | File)[];
  is_featured: boolean;
  description_html: string;
  highlights: string[];
  get_tickets_url: string;
  status: EventStatus;
  price: number;
  performances: Performance[];

  // Location
  venue_id: string | null;
  venue_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: string;
  longitude: string;

  // Host
  host_name: string;
  host_username: string;
  host_bio: string;
  host_avatar: string | File | null;
  host_verified: boolean;

  // Artist
  artist_name: string;
  artist_description: string;
  artist_category: string;
  artist_image: string | File | null;
  artist_cover_image: string | File | null;

  // Recommendations
  selected_restaurants: string[];
  selected_hotels: string[];
  selected_bars: string[];

  // Programme
  linked_programme_id: string | null;
}

export const DEFAULT_STATE: EventFormState = {
  title: '',
  category: 'Theater',
  tags: [],
  cover_image: null,
  gallery: [],
  is_featured: false,
  description_html: '',
  highlights: [],
  get_tickets_url: '',
  status: 'published',
  price: 0,
  performances: [
    { id: 'p1', date: '', start_time: '19:30', end_time: '21:30', type: 'evening' },
  ],
  venue_id: null,
  venue_name: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'United Kingdom',
  latitude: '',
  longitude: '',
  host_name: '',
  host_username: '',
  host_bio: '',
  host_avatar: null,
  host_verified: false,
  artist_name: '',
  artist_description: '',
  artist_category: '',
  artist_image: null,
  artist_cover_image: null,
  selected_restaurants: [],
  selected_hotels: [],
  selected_bars: [],
  linked_programme_id: null,
};
