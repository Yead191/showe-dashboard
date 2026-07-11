import type { Venue } from '@/types/venue';
import type { VenueTier } from '@/types/auth';
import type {
  CreateOrganizationVenueArgs,
  VenuePayloadData,
} from '@/store/api/organizationApi/venueApi';

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

/** Builds API payload: JSON `data` + optional `cover_image` / `logo_image` files. */
export function venueFormStateToPayload(state: VenueFormState): CreateOrganizationVenueArgs {
  const lat = state.latitude.trim();
  const lng = state.longitude.trim();

  const data: VenuePayloadData = {
    name: state.name.trim(),
    status: state.status,
    description: state.description.trim() || undefined,
    address_line1: state.address_line1.trim(),
    address_line2: state.address_line2.trim() || undefined,
    city: state.city.trim(),
    state: state.state.trim() || undefined,
    country: state.country.trim(),
    zip_code: state.zip_code.trim(),
    contact_email: state.contact_email.trim(),
    contact_phone: state.contact_phone.trim() || undefined,
    website: state.website.trim() || undefined,
    brand_color: state.brand_color.trim() || undefined,
  };

  if (lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
    data.coordinates = {
      latitude: Number(lat),
      longitude: Number(lng),
    };
  }

  return {
    data,
    cover_image: state.cover_image instanceof File ? state.cover_image : undefined,
    logo_image: state.logo instanceof File ? state.logo : undefined,
  };
}
