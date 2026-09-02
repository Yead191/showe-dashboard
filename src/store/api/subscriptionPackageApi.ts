import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiSubscriptionPackage {
  _id: string;
  vanues: number;
  programmes: number;
  is_proggramme_sell: boolean;
  priceId?: string;
  product?: string;
  payment_link?: string;
  features: string[];
  status: string;
  audience: string;
  modules: number[];
  description: string;
  can_charge: boolean;
  label: string;
  short: string;
  color: string;
  priceMonthly: number;
  recommended: boolean;
  minimum_programme_price?: number;
  download_fee_price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPackagePayload {
  label: string;
  short: string;
  audience: string;
  modules: number[];
  can_charge: boolean;
  description: string;
  color: string;
  priceMonthly: number;
  features: string[];
  vanues: number;
  programmes: number;
  is_proggramme_sell: boolean;
  minimum_programme_price?: number;
  download_fee_price?: number;
}

export interface UpdateSubscriptionPackageRequest {
  id: string;
  data: SubscriptionPackagePayload;
}

export const subscriptionPackageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPackages: builder.query<ApiSubscriptionPackage[], void>({
      query: () => ({
        method: 'GET',
        url: '/package',
      }),
      transformResponse: (response: ApiResponse<ApiSubscriptionPackage[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'SubscriptionPackages' as const, id: _id })),
              { type: 'SubscriptionPackages', id: 'LIST' },
            ]
          : [{ type: 'SubscriptionPackages', id: 'LIST' }],
    }),
    createSubscriptionPackage: builder.mutation<
      { success: boolean; message: string },
      SubscriptionPackagePayload
    >({
      query: (body) => ({
        method: 'POST',
        url: '/package',
        body,
      }),
      invalidatesTags: [{ type: 'SubscriptionPackages', id: 'LIST' }],
    }),
    updateSubscriptionPackage: builder.mutation<
      { success: boolean; message: string },
      UpdateSubscriptionPackageRequest
    >({
      query: ({ id, data }) => ({
        method: 'PATCH',
        url: `/package/${id}`,
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SubscriptionPackages', id },
        { type: 'SubscriptionPackages', id: 'LIST' },
      ],
    }),
    deleteSubscriptionPackage: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        method: 'DELETE',
        url: `/package/${id}`,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SubscriptionPackages', id },
        { type: 'SubscriptionPackages', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSubscriptionPackagesQuery,
  useCreateSubscriptionPackageMutation,
  useUpdateSubscriptionPackageMutation,
  useDeleteSubscriptionPackageMutation,
} = subscriptionPackageApi;
