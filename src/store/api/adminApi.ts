import { baseApi } from '@/store/api/baseApi';
import type {
  AdminUser,
  CreateAdminPayload,
  GetAdminsParams,
  GetAdminsResponse,
  SingleAdminResponse,
  UpdateAdminPayload,
} from '@/types/admin';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<GetAdminsResponse, GetAdminsParams | void>({
      query: (params) => ({
        url: '/admin',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm?.trim()
            ? { searchTerm: params.searchTerm.trim() }
            : {}),
          ...(params?.role ? { role: params.role } : {}),
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'Admins' as const,
                id: _id,
              })),
              { type: 'Admins', id: 'LIST' },
            ]
          : [{ type: 'Admins', id: 'LIST' }],
    }),

    getAdminById: builder.query<AdminUser, string>({
      query: (id) => ({
        url: `/admin/${id}`,
      }),
      transformResponse: (response: SingleAdminResponse | { data: AdminUser } | AdminUser) => {
        if ('data' in response && response.data) {
          return response.data;
        }
        return response as AdminUser;
      },
      providesTags: (_result, _error, id) => [{ type: 'Admins', id }],
    }),

    createAdmin: builder.mutation<SingleAdminResponse, CreateAdminPayload>({
      query: (body) => ({
        url: '/admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Admins', id: 'LIST' }],
    }),

    updateAdmin: builder.mutation<
      SingleAdminResponse,
      { id: string; data: UpdateAdminPayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Admins', id },
        { type: 'Admins', id: 'LIST' },
      ],
    }),

    deleteAdmin: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Admins', id },
        { type: 'Admins', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useGetAdminByIdQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} = adminApi;
