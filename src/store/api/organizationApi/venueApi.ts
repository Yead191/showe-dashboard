import { baseApi } from '@/store/api/baseApi';
import type { Venue } from '@/types/venue';

interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: T;
}

export interface VenueOwnerRef {
  _id: string;
  name: string;
  email: string;
  image: string;
}

export interface ApiVenue {
  _id: string;
  owner: VenueOwnerRef;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  cover_image: string;
  logo?: string;
  description?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  country: string;
  zip_code: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  brand_color?: string;
  programmes_count: number;
  events_count: number;
  total_downloads: number;
  total_revenue: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VenuePayloadData {
  name: string;
  status: 'active' | 'suspended' | 'pending';
  description?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  country: string;
  zip_code: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contact_email: string;
  contact_phone?: string;
  website?: string;
  brand_color?: string;
}

export interface CreateOrganizationVenueArgs {
  data: VenuePayloadData;
  cover_image?: File;
  logo_image?: File;
}

export interface UpdateOrganizationVenueArgs extends CreateOrganizationVenueArgs {
  id: string;
}

export interface GetVenuesParams {
  page?: number;
  limit?: number;
}

export interface GetVenuesResult {
  venues: ApiVenue[];
  pagination: PaginatedApiResponse<ApiVenue[]>['pagination'];
}

function buildVenueFormData({
  data,
  cover_image,
  logo_image,
}: CreateOrganizationVenueArgs): FormData {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (cover_image) formData.append('cover_image', cover_image);
  if (logo_image) formData.append('logo_image', logo_image);
  return formData;
}

export function mapApiVenueToVenue(api: ApiVenue): Venue {
  return {
    id: api._id,
    owner_id: api.owner._id,
    name: api.name,
    slug: api.name.toLowerCase().replace(/\s+/g, '-'),
    tier: 'tier_2',
    status: api.status,
    // Keep API-relative paths; resolve with getImageUrl at render time.
    cover_image: api.cover_image,
    logo: api.logo,
    description: api.description,
    address_line1: api.address_line1,
    address_line2: api.address_line2,
    city: api.city,
    state: api.state,
    country: api.country,
    zip_code: api.zip_code,
    coordinates: api.coordinates,
    contact_email: api.contact_email,
    contact_phone: api.contact_phone,
    website: api.website,
    brand_color: api.brand_color,
    programmes_count: api.programmes_count,
    events_count: api.events_count,
    total_downloads: api.total_downloads,
    total_revenue: api.total_revenue,
    created_at: api.createdAt,
    updated_at: api.updatedAt,
  };
}

export const venuesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationVenues: builder.query<GetVenuesResult, GetVenuesParams | void>({
      query: (params) => ({
        url: '/vanue',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      transformResponse: (response: PaginatedApiResponse<ApiVenue[]>) => ({
        venues: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.venues.map(({ _id }) => ({ type: 'Venues' as const, id: _id })),
              { type: 'Venues', id: 'LIST' },
            ]
          : [{ type: 'Venues', id: 'LIST' }],
    }),
    createOrganizationVenue: builder.mutation<
      { success: boolean; message: string },
      CreateOrganizationVenueArgs
    >({
      query: (args) => ({
        url: '/vanue',
        method: 'POST',
        body: buildVenueFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: [{ type: 'Venues', id: 'LIST' }],
    }),
    updateOrganizationVenue: builder.mutation<
      { success: boolean; message: string },
      UpdateOrganizationVenueArgs
    >({
      query: ({ id, ...args }) => ({
        url: `/vanue/${id}`,
        method: 'PATCH',
        body: buildVenueFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Venues', id },
        { type: 'Venues', id: 'LIST' },
      ],
    }),
    deleteOrganizationVenue: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/vanue/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Venues', id },
        { type: 'Venues', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetOrganizationVenuesQuery,
  useDeleteOrganizationVenueMutation,
  useCreateOrganizationVenueMutation,
  useUpdateOrganizationVenueMutation,
} = venuesApi;
