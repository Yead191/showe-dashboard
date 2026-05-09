import type { Performance } from '@/types/event';

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
  performances: Performance[];
  
  // Location
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

  // Recommendations
  selected_restaurants: string[];
  selected_hotels: string[];
  selected_bars: string[];
}

export const DEFAULT_STATE: EventFormState = {
  title: '',
  category: 'Theatre',
  tags: [],
  cover_image: null,
  gallery: [],
  is_featured: false,
  description_html: '',
  highlights: [],
  get_tickets_url: '',
  performances: [
    { id: 'p1', date: '', start_time: '19:30', end_time: '21:30', type: 'evening' },
  ],
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
  selected_restaurants: [],
  selected_hotels: [],
  selected_bars: [],
};
