import { baseApi } from '@/store/api/baseApi';
import type { ProgrammeDoc } from '@/types/programme';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export function unwrapBlock(block: any): any {
  if (!block) return block;
  const { id, _id, type, module, animation, layout, data, ...rest } = block;
  const blockData = data || {};
  const generatedId = `blk_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  return {
    type,
    module,
    animation,
    layout,
    ...rest,
    ...blockData,
    id: id || _id || blockData.id || blockData._id || generatedId,
  };
}

export function normalizeProgramme(p: any): ProgrammeDoc {
  if (!p) return p;
  const id = p.id || p._id;
  const pages = Array.isArray(p.pages)
    ? p.pages.map((page: any) => ({
      ...page,
      id: page.id || page._id || `pg_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
      blocks: Array.isArray(page.blocks)
        ? page.blocks.map(unwrapBlock)
        : [],
    }))
    : [];
  return {
    ...p,
    id,
    pages,
  } as ProgrammeDoc;
}

export function wrapBlock(block: any): any {
  if (!block) return block;
  const { id, _id, type, module, animation, layout, data, ...rest } = block;
  const blockId = id || _id;
  // Keep id inside data so it is never lost by the database schema
  const blockData = data !== undefined ? { ...data, id: blockId } : { ...rest, id: blockId };
  return {
    _id: blockId,
    type,
    module,
    animation,
    layout,
    data: blockData,
  };
}

export function preparePayload(p: any): any {
  if (!p) return p;
  const _id = p.id || p._id;
  const pages = Array.isArray(p.pages)
    ? p.pages.map((page: any) => ({
      ...page,
      _id: page.id || page._id,
      blocks: Array.isArray(page.blocks)
        ? page.blocks.map(wrapBlock)
        : [],
    }))
    : undefined;
  const result = {
    ...p,
  };
  if (_id !== undefined) {
    result._id = _id;
  }
  if (pages !== undefined) {
    result.pages = pages;
  }
  return result;
}

export const programmesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProgrammes: builder.query<ProgrammeDoc[], { venue_id?: string } | void>({
      query: (params) => ({
        url: '/programmes',
        method: 'GET',
        params: {
          ...params,
          // _t: Date.now(),
        },
      }),
      transformResponse: (response: ApiResponse<any[]>) => {
        return (response.data || []).map(normalizeProgramme);
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Programmes' as const, id })),
            { type: 'Programmes', id: 'LIST' },
          ]
          : [{ type: 'Programmes', id: 'LIST' }],
    }),
    getProgramme: builder.query<ProgrammeDoc, string>({
      query: (id) => ({
        url: `/programmes/${id}`,
        method: 'GET',
        // params: {
        //   _t: Date.now(),
        // },
      }
      ),
      transformResponse: (response: ApiResponse<any>) => normalizeProgramme(response.data),
      providesTags: (_result, _error, id) => [{ type: 'Programmes', id }],

    }),
    createProgramme: builder.mutation<
      ApiResponse<ProgrammeDoc>,
      Partial<ProgrammeDoc>
    >({
      query: (body) => ({
        url: '/programmes',
        method: 'POST',
        body: preparePayload(body),
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: normalizeProgramme(response.data),
      }),
      invalidatesTags: [{ type: 'Programmes', id: 'LIST' }],
    }),
    updateProgramme: builder.mutation<
      ApiResponse<ProgrammeDoc>,
      { id: string; data: Partial<ProgrammeDoc> }
    >({
      query: ({ id, data }) => ({
        url: `/programmes/${id}`,
        method: 'PATCH',
        body: preparePayload(data),
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: normalizeProgramme(response.data),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Programmes', id },
        { type: 'Programmes', id: 'LIST' },
      ],
    }),
    duplicateProgramme: builder.mutation<ApiResponse<ProgrammeDoc>, string>({
      query: (id) => ({
        url: `/programmes/${id}/duplicate`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<any>) => ({
        ...response,
        data: normalizeProgramme(response.data),
      }),
      invalidatesTags: [{ type: 'Programmes', id: 'LIST' }],
    }),
    deleteProgramme: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/programmes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Programmes', id },
        { type: 'Programmes', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProgrammesQuery,
  useGetProgrammeQuery,
  useCreateProgrammeMutation,
  useUpdateProgrammeMutation,
  useDuplicateProgrammeMutation,
  useDeleteProgrammeMutation,
} = programmesApi;
