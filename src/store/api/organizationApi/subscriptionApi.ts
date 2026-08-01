import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface MySubscriptionUser {
  _id: string;
  name: string;
  email: string;
  image: string;
}

export interface MySubscription {
  _id: string;
  name: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
  user: MySubscriptionUser;
  txId: string;
  package: string;
  modules: number[];
  addons: string[];
  createdAt: string;
  updatedAt: string;
  remainingDays?: number;
}

export interface UpdateSubscriptionRequest {
  receipt: string;
}

export interface UpdateSubscriptionResult {
  success: boolean;
  message: string;
  /** Stripe Checkout URL when payment is required. */
  data?: string;
}

export const organizationSubscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMySubscription: builder.query<MySubscription | null, void>({
      query: () => ({
        url: '/subscription/subscribe',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<MySubscription | null>) => response.data ?? null,
      providesTags: [{ type: 'Subscriptions', id: 'MINE' }],
    }),

    updateSubscription: builder.mutation<UpdateSubscriptionResult, UpdateSubscriptionRequest>({
      query: (body) => ({
        url: '/subscription/stripe',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Subscriptions', id: 'MINE' }],
    }),

    purchaseAddOn: builder.mutation<{ success: boolean; message: string; data?: string }, string>({
      query: (id) => ({
        url: `/addon/purchase/${id}`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Subscriptions', id: 'MINE' },
        { type: 'AddOns', id: 'LIST' },
      ],
    }),

    cancelMySubscription: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/subscription/cancel/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Subscriptions', id: 'MINE' }],
    }),
  }),
});

export const {
  useGetMySubscriptionQuery,
  useUpdateSubscriptionMutation,
  usePurchaseAddOnMutation,
  useCancelMySubscriptionMutation,
} = organizationSubscriptionApi;
