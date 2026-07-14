import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AnalyticsStats {
  active_user: number;
  total_views: number;
  proggrammes_solds: number;
  avg_download_per_event: number;
}

export interface AnalyticsGraphPoint {
  month: number;
  label: string;
  clicks: number;
  views: number;
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalyticsViewGraph: builder.query<AnalyticsGraphPoint[], void>({
      query: () => ({
        url: '/dashboard/admin/view-graph-data',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AnalyticsGraphPoint[]>) => response.data,
      providesTags: ['DashboardStats'],
    }),
    getAnalyticsStats: builder.query<AnalyticsStats, void>({
      query: () => ({
        url: '/dashboard/admin/analytics-stats',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AnalyticsStats>) => response.data,
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const { useGetAnalyticsViewGraphQuery, useGetAnalyticsStatsQuery } = analyticsApi;
