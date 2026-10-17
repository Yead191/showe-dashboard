import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AddressWiseInfo {
  totalPrice: number;
  eventId: string;
  eventAddress: string;
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddressWiseInfo: builder.query<AddressWiseInfo[], void>({
      query: () => ({
        url: '/booking/address-wise-info',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AddressWiseInfo[]>) => response.data ?? [],
      providesTags: ['DashboardStats'],
    }),
  }),
});

export const { useGetAddressWiseInfoQuery } = bookingApi;
