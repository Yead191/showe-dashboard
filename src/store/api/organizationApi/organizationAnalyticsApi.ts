import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type AnalyticsDateRange = 'last7Days' | 'last30Days' | 'thisYear';

export interface ProgrammesAnalyticsParams {
  date_range: AnalyticsDateRange;
  /** Programme id, or empty string for all. Sent as `ids[]`. */
  ids: string;
}

export interface AnalyticsStats {
  totalClicks: number;
  totalViews: number;
  totalSolds: number;
  avgDwellTime: number;
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

export interface DwellTimeYearPoint {
  month: number;
  label: string;
  dwellTime: number;
}

export interface DwellTimeDayPoint {
  date: string;
  dayOfWeek: number;
  label: string;
  dwellTime: number;
}

export type DwellTimeGraphPoint = DwellTimeYearPoint | DwellTimeDayPoint;

function analyticsQueryParams({ date_range, ids }: ProgrammesAnalyticsParams) {
  return {
    date_range,
    'ids[]': ids ?? '',
  };
}

export const organizationAnalyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationAnalyticsViewAndClickGraph: builder.query<
      AnalyticsGraphPoint[],
      ProgrammesAnalyticsParams
    >({
      query: (params) => ({
        url: '/programmes/graph-data',
        method: 'GET',
        params: analyticsQueryParams(params),
      }),
      transformResponse: (response: ApiResponse<AnalyticsGraphPoint[]>) => response.data,
      providesTags: ['DashboardStats'],
    }),
    getOrganizationAnalyticsRevenueGraph: builder.query<
      RevenueGraphPoint[],
      ProgrammesAnalyticsParams
    >({
      query: (params) => ({
        url: '/programmes/revenue-graph-data',
        method: 'GET',
        params: analyticsQueryParams(params),
      }),
      transformResponse: (response: ApiResponse<RevenueGraphPoint[]>) => response.data,
      providesTags: ['DashboardStats'],
    }),
    getOrganizationAnalyticsDwellTimeGraph: builder.query<
      DwellTimeGraphPoint[],
      ProgrammesAnalyticsParams
    >({
      query: (params) => ({
        url: '/programmes/dwell-time-graph-data',
        method: 'GET',
        params: analyticsQueryParams(params),
      }),
      transformResponse: (response: ApiResponse<DwellTimeGraphPoint[]>) => response.data,
      providesTags: ['DashboardStats'],
    }),
    getOrganizationAnalyticsStats: builder.query<AnalyticsStats, ProgrammesAnalyticsParams>({
      query: (params) => ({
        url: '/programmes/analytics',
        method: 'GET',
        params: analyticsQueryParams(params),
      }),
      transformResponse: (
        response: ApiResponse<AnalyticsStats & { ctotalClicks?: number }>,
      ) => {
        const data = response.data;
        return {
          totalViews: data.totalViews ?? 0,
          totalSolds: data.totalSolds ?? 0,
          totalClicks: data.totalClicks ?? data.ctotalClicks ?? 0,
          avgDwellTime: data.avgDwellTime ?? 0,
        };
      },
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const {
  useGetOrganizationAnalyticsViewAndClickGraphQuery,
  useGetOrganizationAnalyticsRevenueGraphQuery,
  useGetOrganizationAnalyticsDwellTimeGraphQuery,
  useGetOrganizationAnalyticsStatsQuery,
} = organizationAnalyticsApi;
