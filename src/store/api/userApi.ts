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

export interface ApiUser {
  _id: string;
  name: string;
  role: string;
  email: string;
  image: string;
  status: 'active' | 'suspended';
  contact: string | null;
  location: string | null;
  verified: boolean;
  subscription: string | null;
  isSuspended: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  suspendedDays: number | null;
  suspendedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  organization_name?: string;
  website?: string;
  contact_name?: string;
  country?: string;
  organization_type?: string;
  phone?: string;
  use_case?: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
}

export interface GetUsersResult {
  users: ApiUser[];
  pagination: PaginatedApiResponse<ApiUser[]>['pagination'];
}

export interface SuspendUserRequest {
  id: string;
  days: number;
  reason: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResult, GetUsersParams | void>({
      query: (params) => ({
        url: '/user',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      transformResponse: (response: PaginatedApiResponse<ApiUser[]>) => ({
        users: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ _id }) => ({ type: 'Users' as const, id: _id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
    userSuspend: builder.mutation<{ success: boolean; message: string }, SuspendUserRequest>({
      query: ({ id, days, reason }) => ({
        url: `/user/suspend/${id}`,
        method: 'POST',
        body: { days, reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Users', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetUsersQuery, useUserSuspendMutation } = userApi;
