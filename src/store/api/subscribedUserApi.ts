import { baseApi } from "@/store/api/baseApi";

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
  image?: string;
}

export interface ApiSubscribedUser {
  _id: string;
  name: string;
  price: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  user: SubscribedUserRef;
  txId: string;
  package: {
    _id: string;
  };
  modules: number[];
  addons?: string[];
  vanues?: number;
  programmes?: number;
  is_proggramme_sell?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetSubscribedUsersParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
}

export interface GetSubscribedUsersResult {
  subscriptions: ApiSubscribedUser[];
  pagination: PaginatedApiResponse<ApiSubscribedUser[]>["pagination"];
}

export const subscribedUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribedUsers: builder.query<
      GetSubscribedUsersResult,
      GetSubscribedUsersParams | void
    >({
      query: (params) => ({
        url: "/subscription/subscribed-users",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm?.trim()
            ? { searchTerm: params.searchTerm.trim() }
            : {}),
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      transformResponse: (
        response: PaginatedApiResponse<ApiSubscribedUser[]>,
      ) => ({
        subscriptions: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.subscriptions.map(({ _id }) => ({
                type: "SubscribedUsers" as const,
                id: _id,
              })),
              { type: "SubscribedUsers", id: "LIST" },
            ]
          : [{ type: "SubscribedUsers", id: "LIST" }],
    }),
    cancelSubscription: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/subscription/cancel/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "SubscribedUsers", id },
        { type: "SubscribedUsers", id: "LIST" },
      ],
    }),
    changeSubscriptionPackage: builder.mutation<
      { success: boolean; message: string },
      { userId: string; packageId: string }
    >({
      query: (body) => ({
        url: "/subscription/change-package",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SubscribedUsers", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSubscribedUsersQuery,
  useCancelSubscriptionMutation,
  useChangeSubscriptionPackageMutation,
} = subscribedUserApi;
