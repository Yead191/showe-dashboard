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

export interface SubscribedUserRef {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ApiSubscribedUser {
  _id: string;
  name: string;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  user: SubscribedUserRef;
  txId: string;
  package: {
    _id: string;
  };
  modules: number[];
  addons?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetSubscribedUsersParams {
  page?: number;
  limit?: number;
}

export interface GetSubscribedUsersResult {
  subscriptions: ApiSubscribedUser[];
  pagination: PaginatedApiResponse<ApiSubscribedUser[]>['pagination'];
}

export const subscribedUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribedUsers: builder.query<GetSubscribedUsersResult, GetSubscribedUsersParams | void>({
      query: (params) => ({
        url: '/subscription/subscribed-users',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      transformResponse: (response: PaginatedApiResponse<ApiSubscribedUser[]>) => ({
        subscriptions: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.subscriptions.map(({ _id }) => ({ type: 'SubscribedUsers' as const, id: _id })),
              { type: 'SubscribedUsers', id: 'LIST' },
            ]
          : [{ type: 'SubscribedUsers', id: 'LIST' }],
    }),
    cancelSubscription: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/subscription/cancel/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SubscribedUsers', id },
        { type: 'SubscribedUsers', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetSubscribedUsersQuery, useCancelSubscriptionMutation } = subscribedUserApi;
