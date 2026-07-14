import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminRevenuePoint {
  month: number;
  label: string;
  revenue: number;
  count: number;
}

export interface AdminDashboardStats {
  totalRevenue: number;
  totalVanues: number;
  totalActiveUsers: number;
  totalCommission: number;
}

export const adminOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminRevenueGraph: builder.query<AdminRevenuePoint[], void>({
      query: () => ({
        url: '/dashboard/admin/revenue-graph-data',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AdminRevenuePoint[]>) => response.data,
      providesTags: ['DashboardStats'],
    }),
    getAdminDashboardStats: builder.query<AdminDashboardStats, void>({
      query: () => ({
        url: '/dashboard/admin/dashboard-stats',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AdminDashboardStats>) => response.data,
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const { useGetAdminRevenueGraphQuery, useGetAdminDashboardStatsQuery } = adminOverviewApi;
