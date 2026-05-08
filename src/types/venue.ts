import type { VenueTier } from './auth';

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  tier: VenueTier;
  status: 'active' | 'suspended' | 'pending';
  cover_image: string;
  logo?: string;
  description?: string;
  // Location
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  country: string;
  zip_code: string;
  coordinates?: { latitude: number; longitude: number };
  // Contact
  contact_email: string;
  contact_phone?: string;
  website?: string;
  // Branding
  brand_color?: string;
  // Stats (denormalised for display)
  programmes_count: number;
  events_count: number;
  total_downloads: number;
  total_revenue: number; // GBP
  // Meta
  created_at: string;
  updated_at: string;
}

export interface VenueOwner {
  id: string;
  name: string;
  email: string;
  org_name: string;
  org_type: 'school' | 'venue' | 'producer';
  tier: VenueTier;
  status: 'active' | 'suspended' | 'pending';
  venues_count: number;
  total_revenue: number;
  joined_at: string;
  last_login_at?: string;
  avatar_url?: string;
  phone?: string;
  subscription_status: 'active' | 'past_due' | 'cancelled';
}
