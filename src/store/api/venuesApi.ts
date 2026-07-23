import { baseApi } from '@/store/api/baseApi';

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

export interface GetVenuesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
}

export interface GetVenuesResult {
  venues: ApiVenue[];
  pagination: PaginatedApiResponse<ApiVenue[]>['pagination'];
}

export const venuesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVenues: builder.query<GetVenuesResult, GetVenuesParams | void>({
      query: (params) => ({
        url: '/vanue',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm?.trim()
            ? { searchTerm: params.searchTerm.trim() }
            : {}),
          ...(params?.status ? { status: params.status } : {}),
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
    deleteVenue: builder.mutation<{ success: boolean; message: string }, string>({
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

export const { useGetVenuesQuery, useDeleteVenueMutation } = venuesApi;
