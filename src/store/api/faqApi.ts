import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiFaq {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaqPayload {
  question: string;
  answer: string;
}

export interface UpdateFaqRequest {
  id: string;
  data: FaqPayload;
}

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<ApiFaq[], void>({
      query: () => ({
        url: '/faq',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<ApiFaq[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Faqs' as const, id: _id })),
              { type: 'Faqs', id: 'LIST' },
            ]
          : [{ type: 'Faqs', id: 'LIST' }],
    }),
    createFaq: builder.mutation<{ success: boolean; message: string }, FaqPayload>({
      query: (body) => ({
        url: '/faq',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Faqs', id: 'LIST' }],
    }),
    updateFaq: builder.mutation<{ success: boolean; message: string }, UpdateFaqRequest>({
      query: ({ id, data }) => ({
        url: `/faq/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Faqs', id },
        { type: 'Faqs', id: 'LIST' },
      ],
    }),
    deleteFaq: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/faq/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Faqs', id },
        { type: 'Faqs', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi;
