import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

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

export type ArtistType =
  | 'Solo Artist'
  | 'Band'
  | 'DJ'
  | 'Orchestra'
  | 'Comedian'
  | string;

export interface ApiArtist {
  _id: string;
  name: string;
  image?: string;
  cover_image?: string;
  short_description?: string;
  category?: string;
  type?: ArtistType;
  orgainzation?: string;
  genres?: string[];
  instruments?: string[];
  languages?: string[];
  career_start_year?: number;
  origin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetArtistsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface GetArtistsResult {
  artists: ApiArtist[];
  pagination: PaginatedApiResponse<ApiArtist[]>['pagination'];
}

export interface CreateArtistArgs {
  name: string;
  type: string;
  career_start_year?: number | string;
  genres?: string[];
  instruments?: string[];
  languages?: string[];
  origin?: string;
  short_description?: string;
  category?: string;
  image?: File;
  cover_image?: File;
}

export interface UpdateArtistArgs extends CreateArtistArgs {
  id: string;
}

function appendArrayField(formData: FormData, key: string, values: string[] = []) {
  values.forEach((value) => {
    if (value) formData.append(key, value);
  });
}

function buildArtistFormData({
  name,
  type,
  career_start_year,
  genres,
  instruments,
  languages,
  origin,
  short_description,
  category,
  image,
  cover_image,
}: CreateArtistArgs): FormData {
  const formData = new FormData();

  formData.append('name', name);
  formData.append('type', type);
  if (career_start_year !== undefined && career_start_year !== '') {
    formData.append('career_start_year', String(career_start_year));
  }
  formData.append('origin', origin ?? '');
  formData.append('short_description', short_description ?? '');
  formData.append('category', category ?? '');

  appendArrayField(formData, 'genres[]', genres);
  appendArrayField(formData, 'instruments[]', instruments);
  appendArrayField(formData, 'languages[]', languages);

  if (image) formData.append('image', image);
  if (cover_image) formData.append('cover_image', cover_image);

  return formData;
}

export const artistsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllArtists: builder.query<GetArtistsResult, GetArtistsParams | void>({
      query: (params) => ({
        url: '/artist',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm?.trim()
            ? { searchTerm: params.searchTerm.trim() }
            : {}),
        },
      }),
      transformResponse: (response: PaginatedApiResponse<ApiArtist[]>) => ({
        artists: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.artists.map(({ _id }) => ({ type: 'Artists' as const, id: _id })),
              { type: 'Artists', id: 'LIST' },
            ]
          : [{ type: 'Artists', id: 'LIST' }],
    }),

    getArtist: builder.query<ApiArtist, string>({
      query: (id) => ({
        url: `/artist/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<ApiArtist>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Artists', id }],
    }),

    createArtist: builder.mutation<{ success: boolean; message: string }, CreateArtistArgs>({
      query: (args) => ({
        url: '/artist',
        method: 'POST',
        body: buildArtistFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: [{ type: 'Artists', id: 'LIST' }],
    }),

    updateArtist: builder.mutation<{ success: boolean; message: string }, UpdateArtistArgs>({
      query: ({ id, ...args }) => ({
        url: `/artist/${id}`,
        method: 'PATCH',
        body: buildArtistFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Artists', id },
        { type: 'Artists', id: 'LIST' },
      ],
    }),

    deleteArtist: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/artist/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Artists', id },
        { type: 'Artists', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllArtistsQuery,
  useGetArtistQuery,
  useCreateArtistMutation,
  useUpdateArtistMutation,
  useDeleteArtistMutation,
} = artistsApi;
