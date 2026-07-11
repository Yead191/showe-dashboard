import { baseApi } from '@/store/api/baseApi';
import type { Recommendation } from '@/constants/mock-recommendation';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

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

/** API category enum (backend spelling). */
export type ApiRecommendationCategory = 'hotel' | 'bar' | 'restrudants' | 'other';

export interface ApiRecommendation {
  _id: string;
  name: string;
  image?: string;
  category: string;
  rating: number;
  distance: string;
  price: string;
  location: string;
  description?: string;
  website?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetRecommendationsParams {
  page?: number;
  limit?: number;
}

export interface GetRecommendationsResult {
  recommendations: ApiRecommendation[];
  pagination: PaginatedApiResponse<ApiRecommendation[]>['pagination'];
}

export interface CreateRecommendationArgs {
  name: string;
  category: string;
  rating: number | string;
  distance: string;
  price: string;
  location: string;
  description?: string;
  website?: string;
  image?: File;
}

export interface UpdateRecommendationArgs extends CreateRecommendationArgs {
  id: string;
}

function buildRecommendationFormData({
  name,
  category,
  rating,
  distance,
  price,
  location,
  description,
  website,
  image,
}: CreateRecommendationArgs): FormData {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('category', category);
  formData.append('rating', String(rating));
  formData.append('distance', distance);
  formData.append('price', price);
  formData.append('location', location);
  formData.append('description', description ?? '');
  formData.append('website', website ?? '');
  if (image) {
    formData.append('image', image);
  }
  return formData;
}

export function mapApiRecommendationToRecommendation(api: ApiRecommendation): Recommendation {
  return {
    id: api._id,
    name: api.name,
    // Keep API-relative path; resolve with getImageUrl at render time.
    image: api.image ?? '',
    category: (api.category ?? '').trim(),
    rating: Number(api.rating) || 0,
    distance: api.distance,
    price: toPoundPrice(api.price),
    location: api.location,
    total_clicks: 0,
    revenue: 0,
    url: api.website,
    description: api.description,
  };
}

function toPoundPrice(price: string): string {
  const trimmed = (price ?? '').trim();
  if (/^\$+$/.test(trimmed)) {
    return '£'.repeat(trimmed.length);
  }
  return trimmed;
}

export const recommendationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationRecommendations: builder.query<
      GetRecommendationsResult,
      GetRecommendationsParams | void
    >({
      query: (params) => ({
        url: '/recommendations',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
        },
      }),
      transformResponse: (response: PaginatedApiResponse<ApiRecommendation[]>) => ({
        recommendations: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.recommendations.map(({ _id }) => ({
                type: 'Recommendations' as const,
                id: _id,
              })),
              { type: 'Recommendations', id: 'LIST' },
            ]
          : [{ type: 'Recommendations', id: 'LIST' }],
    }),
    getOrganizationRecommendation: builder.query<ApiRecommendation, string>({
      query: (id) => ({
        url: `/recommendations/${id}`,
      }),
      transformResponse: (response: ApiResponse<ApiRecommendation>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Recommendations', id }],
    }),
    createOrganizationRecommendation: builder.mutation<
      { success: boolean; message: string },
      CreateRecommendationArgs
    >({
      query: (args) => ({
        url: '/recommendations',
        method: 'POST',
        body: buildRecommendationFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: [{ type: 'Recommendations', id: 'LIST' }],
    }),
    updateOrganizationRecommendation: builder.mutation<
      { success: boolean; message: string },
      UpdateRecommendationArgs
    >({
      query: ({ id, ...args }) => ({
        url: `/recommendations/${id}`,
        method: 'PATCH',
        body: buildRecommendationFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Recommendations', id },
        { type: 'Recommendations', id: 'LIST' },
      ],
    }),
    deleteOrganizationRecommendation: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/recommendations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Recommendations', id },
        { type: 'Recommendations', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetOrganizationRecommendationsQuery,
  useGetOrganizationRecommendationQuery,
  useCreateOrganizationRecommendationMutation,
  useUpdateOrganizationRecommendationMutation,
  useDeleteOrganizationRecommendationMutation,
} = recommendationsApi;
