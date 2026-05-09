import type { Venue } from '@/types/venue';
import type { VenueTier } from '@/types/auth';

export interface VenueFormState {
  name: string;
  slug: string;
  tier: VenueTier;
  status: Venue['status'];
  cover_image: string | File | null;
  logo: string | File | null;
  description: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  brand_color: string;
}

export const DEFAULT_VENUE_FORM_STATE: VenueFormState = {
  name: '',
  slug: '',
  tier: 'tier_2',
  status: 'pending',
  cover_image: null,
  logo: null,
  description: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  country: 'United Kingdom',
  zip_code: '',
  latitude: '',
  longitude: '',
  contact_email: '',
  contact_phone: '',
  website: '',
  brand_color: '#014B52',
};

export function venueToFormState(v: Venue): VenueFormState {
  return {
    name: v.name,
    slug: v.slug,
    tier: v.tier,
    status: v.status,
    cover_image: v.cover_image ?? null,
    logo: v.logo ?? null,
    description: v.description ?? '',
    address_line1: v.address_line1,
    address_line2: v.address_line2 ?? '',
    city: v.city,
    state: v.state ?? '',
    country: v.country,
    zip_code: v.zip_code,
    latitude: v.coordinates ? String(v.coordinates.latitude) : '',
    longitude: v.coordinates ? String(v.coordinates.longitude) : '',
    contact_email: v.contact_email,
    contact_phone: v.contact_phone ?? '',
    website: v.website ?? '',
    brand_color: v.brand_color ?? '#014B52',
  };
}

export function venueFormStateToFormData(state: VenueFormState): FormData {
  const fd = new FormData();
  Object.entries(state).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === 'cover_image' || key === 'logo') {
      if (value instanceof File) {
        fd.append(key, value);
      } else if (typeof value === 'string' && value.length > 0) {
        fd.append(key, value);
      }
      return;
    }
    fd.append(key, String(value));
  });
  return fd;
}
