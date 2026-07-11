import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OrganizationViewPoint {
  month: number;
  label: string;
  clicks: number;
  views: number;
}

export interface OrganizationRevenuePoint {
  month: number;
  label: string;
  revenue: number;
  count: number;
}

export interface OrganizationDashboardStats {
  total_downloads: number;
  total_revenue: number;
  total_events: number;
}

export const organizationOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationViewGraph: builder.query<OrganizationViewPoint[], void>({
      query: () => ({
        url: '/dashboard/organization/view-graph-data',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<OrganizationViewPoint[]>) => response.data,
      providesTags: ['DashboardStats'],
    }),
    getOrganizationRevenueGraph: builder.query<OrganizationRevenuePoint[], void>({
      query: () => ({
        url: '/dashboard/organization/revenue-graph-data',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<OrganizationRevenuePoint[]>) => response.data,
      providesTags: ['DashboardStats'],
    }),
    getOrganizationDashboardStats: builder.query<OrganizationDashboardStats, void>({
      query: () => ({
        url: '/dashboard/organization/stats',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<OrganizationDashboardStats>) => response.data,
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const {
  useGetOrganizationViewGraphQuery,
  useGetOrganizationRevenueGraphQuery,
  useGetOrganizationDashboardStatsQuery,
} = organizationOverviewApi;
