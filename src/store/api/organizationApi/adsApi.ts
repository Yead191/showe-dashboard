import { baseApi } from '@/store/api/baseApi';
import type { Ad } from '@/features/promotions/types';

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

export interface ApiAdUser {
  _id: string;
  name: string;
  email: string;
  image: string;
}

export interface ApiAd {
  _id: string;
  title: string;
  description?: string;
  redirectUrl: string;
  /** Stored image path from API (e.g. `/image/file.jpg`). */
  imageUrl?: string;
  image?: string;
  user: string | ApiAdUser;
  startDate: string;
  endDate: string;
  active: boolean;
  status?: string;
  impressions: number;
  clicks: number;
  views: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdsAnalytics {
  totalImpressions: number;
  totalClicks: number;
  totalViews: number;
  totalRevenue: number;
  activeAdsCount: number;
}

export interface GetAdsParams {
  page?: number;
  limit?: number;
}

export interface GetAdsResult {
  ads: ApiAd[];
  pagination: PaginatedApiResponse<ApiAd[]>['pagination'];
}

export interface CreateAdArgs {
  title: string;
  description?: string;
  redirectUrl: string;
  startDate: string;
  endDate: string;
  active?: boolean;
  image?: File;
}

export interface UpdateAdArgs extends CreateAdArgs {
  id: string;
}

function toDateInput(value: string): string {
  return value.slice(0, 10);
}

function buildAdFormData({
  title,
  description,
  redirectUrl,
  startDate,
  endDate,
  active,
  image,
}: CreateAdArgs): FormData {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description ?? '');
  formData.append('redirectUrl', redirectUrl);
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  if (active !== undefined) {
    formData.append('active', String(active));
  }
  if (image) {
    formData.append('image', image);
  }
  return formData;
}

export function mapApiAdToAd(api: ApiAd): Ad {
  return {
    id: api._id,
    title: api.title,
    description: api.description ?? '',
    // API field is `imageUrl` (relative path); resolve with getImageUrl at render.
    imageUrl: api.imageUrl || api.image,
    redirectUrl: api.redirectUrl,
    startDate: toDateInput(api.startDate),
    endDate: toDateInput(api.endDate),
    active: api.active,
    impressions: api.impressions,
    clicks: api.clicks,
    views: api.views,
    revenue: api.revenue,
  };
}

export const adsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationAds: builder.query<GetAdsResult, GetAdsParams | void>({
      query: (params) => ({
        url: '/ads',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      transformResponse: (response: PaginatedApiResponse<ApiAd[]>) => ({
        ads: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.ads.map(({ _id }) => ({ type: 'Promotions' as const, id: _id })),
              { type: 'Promotions', id: 'LIST' },
            ]
          : [{ type: 'Promotions', id: 'LIST' }],
    }),
    getOrganizationAd: builder.query<ApiAd, string>({
      query: (id) => ({
        url: `/ads/${id}`,
      }),
      transformResponse: (response: ApiResponse<ApiAd>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Promotions', id }],
    }),
    getOrganizationAdsAnalytics: builder.query<AdsAnalytics, void>({
      query: () => ({
        url: '/ads/analytics',
      }),
      transformResponse: (response: ApiResponse<AdsAnalytics>) => response.data,
      providesTags: [{ type: 'Promotions', id: 'ANALYTICS' }],
    }),
    createOrganizationAd: builder.mutation<{ success: boolean; message: string }, CreateAdArgs>({
      query: (args) => ({
        url: '/ads',
        method: 'POST',
        body: buildAdFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: [
        { type: 'Promotions', id: 'LIST' },
        { type: 'Promotions', id: 'ANALYTICS' },
      ],
    }),
    updateOrganizationAd: builder.mutation<{ success: boolean; message: string }, UpdateAdArgs>({
      query: ({ id, ...args }) => ({
        url: `/ads/${id}`,
        method: 'PATCH',
        body: buildAdFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Promotions', id },
        { type: 'Promotions', id: 'LIST' },
        { type: 'Promotions', id: 'ANALYTICS' },
      ],
    }),
    deleteOrganizationAd: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/ads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Promotions', id },
        { type: 'Promotions', id: 'LIST' },
        { type: 'Promotions', id: 'ANALYTICS' },
      ],
    }),
  }),
});

export const {
  useGetOrganizationAdsQuery,
  useGetOrganizationAdQuery,
  useGetOrganizationAdsAnalyticsQuery,
  useCreateOrganizationAdMutation,
  useUpdateOrganizationAdMutation,
  useDeleteOrganizationAdMutation,
} = adsApi;
