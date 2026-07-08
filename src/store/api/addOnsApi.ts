import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiAddOn {
  _id: string;
  label: string;
  short: string;
  description: string;
  bullets: string[];
  priceMonthly: number;
  color: string;
  icon: string;
  linkedModule?: number;
  capabilityKey: string;
  status: 'live' | 'coming_soon' | 'archived';
  availableOn: 'all' | string[];
  createdAt: string;
  updatedAt: string;
}

export interface AddOnPayload {
  label: string;
  short: string;
  description: string;
  bullets: string[];
  priceMonthly: number;
  color: string;
  icon: string;
  linkedModule?: number;
  capabilityKey: string;
  status: string;
  availableOn: 'all' | string[];
}

export interface UpdateAddOnRequest {
  id: string;
  data: AddOnPayload;
}

export const addOnsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddOns: builder.query<ApiAddOn[], void>({
      query: () => ({
        method: 'GET',
        url: '/addon',
      }),
      transformResponse: (response: ApiResponse<ApiAddOn[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'AddOns' as const, id: _id })),
              { type: 'AddOns', id: 'LIST' },
            ]
          : [{ type: 'AddOns', id: 'LIST' }],
    }),
    createAddOns: builder.mutation<{ success: boolean; message: string }, AddOnPayload>({
      query: (body) => ({
        method: 'POST',
        url: '/addon',
        body,
      }),
      invalidatesTags: [{ type: 'AddOns', id: 'LIST' }],
    }),
    updateAddOns: builder.mutation<{ success: boolean; message: string }, UpdateAddOnRequest>({
      query: ({ id, data }) => ({
        method: 'PATCH',
        url: `/addon/${id}`,
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AddOns', id },
        { type: 'AddOns', id: 'LIST' },
      ],
    }),
    deleteAddOns: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        method: 'DELETE',
        url: `/addon/${id}`,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AddOns', id },
        { type: 'AddOns', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAddOnsQuery,
  useCreateAddOnsMutation,
  useUpdateAddOnsMutation,
  useDeleteAddOnsMutation,
} = addOnsApi;
