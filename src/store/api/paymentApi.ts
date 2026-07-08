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

export interface PaymentOwnerRef {
  _id: string;
  name: string;
  email: string;
  image: string;
}

export interface ApiPayment {
  _id: string;
  title: string;
  owner: PaymentOwnerRef;
  amount: number;
  platform_charge: number;
  user: string;
  organization?: string;
  proggramme?: string;
  order?: string;
  status: string;
  payment_status: 'Credit' | 'Debit';
  type: string;
  trx_id: string;
  prev_trx_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
}

export interface GetPaymentsResult {
  payments: ApiPayment[];
  pagination: PaginatedApiResponse<ApiPayment[]>['pagination'];
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<GetPaymentsResult, GetPaymentsParams | void>({
      query: (params) => ({
        url: '/transaction',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      transformResponse: (response: PaginatedApiResponse<ApiPayment[]>) => ({
        payments: response.data,
        pagination: response.pagination,
      }),
      providesTags: ['Payment'],
    }),
  }),
});

export const { useGetPaymentsQuery } = paymentApi;
