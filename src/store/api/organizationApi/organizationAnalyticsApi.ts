import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type AnalyticsDateRange = 'last7Days' | 'last30Days' | 'thisYear';

export interface ProgrammesAnalyticsParams {
  date_range: AnalyticsDateRange;
  ids?: string[];
}

export interface AnalyticsStats {
  totalClicks: number;
  totalViews: number;
  totalSolds: number;
}

export interface AnalyticsYearPoint {
  month: number;
  label: string;
  clicks: number;
  views: number;
}

export interface AnalyticsDayPoint {
  date: string;
  dayOfWeek: number;
  label: string;
  clicks: number;
  views: number;
}

export type AnalyticsGraphPoint = AnalyticsYearPoint | AnalyticsDayPoint;

export interface RevenueYearPoint {
  month: number;
  label: string;
  revenue: number;
  count: number;
}

export interface RevenueDayPoint {
  date: string;
  dayOfWeek: number;
  label: string;
  revenue: number;
  count: number;
}

export type RevenueGraphPoint = RevenueYearPoint | RevenueDayPoint;

export const organizationAnalyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationAnalyticsViewAndClickGraph: builder.query<AnalyticsGraphPoint[], ProgrammesAnalyticsParams>({
      query: ({ date_range, ids }) => ({
        url: '/programmes/graph-data',
        method: 'GET',
        params: {
          date_range,
          ids,
        },
      }),
      transformResponse: (response: ApiResponse<AnalyticsGraphPoint[]>) => response.data,
      providesTags: ['DashboardStats'],
    }),
    getOrganizationAnalyticsRevenueGraph: builder.query<RevenueGraphPoint[], ProgrammesAnalyticsParams>({
      query: ({ date_range, ids }) => ({
        url: '/programmes/revenue-graph-data',
        method: 'GET',
        params: {
          date_range,
          ids,
        },
      }),
      transformResponse: (response: ApiResponse<RevenueGraphPoint[]>) => response.data,
      providesTags: ['DashboardStats'],
    }),
    getOrganizationAnalyticsStats: builder.query<AnalyticsStats, ProgrammesAnalyticsParams>({
      query: ({ date_range, ids }) => ({
        url: '/programmes/analytics',
        method: 'GET',
        params: {
          date_range,
          ids,
        },
      }),
      transformResponse: (response: ApiResponse<AnalyticsStats>) => response.data,
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const {
  useGetOrganizationAnalyticsViewAndClickGraphQuery,
  useGetOrganizationAnalyticsRevenueGraphQuery,
  useGetOrganizationAnalyticsStatsQuery,
} = organizationAnalyticsApi;
