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

export interface ApiActivity {
  _id: string;
  title: string;
  description: string;
  user: string;
  type: string;
}

export interface GetActivitiesParams {
  page?: number;
  limit?: number;
}

export interface GetActivitiesResult {
  activities: ApiActivity[];
  pagination: PaginatedApiResponse<ApiActivity[]>['pagination'];
}

export const organizationActivitiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationActivities: builder.query<GetActivitiesResult, GetActivitiesParams | void>({
      query: (params) => ({
        url: '/activity',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      transformResponse: (response: PaginatedApiResponse<ApiActivity[]>) => ({
        activities: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.activities.map(({ _id }) => ({ type: 'Activities' as const, id: _id })),
              { type: 'Activities', id: 'LIST' },
            ]
          : [{ type: 'Activities', id: 'LIST' }],
    }),
  }),
});

export const { useGetOrganizationActivitiesQuery } = organizationActivitiesApi;
