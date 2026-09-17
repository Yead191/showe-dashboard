import { baseApi } from '@/store/api/baseApi';
import type { ProgrammeDoc } from '@/types/programme';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  pagination?: PaginationInfo;
  data: T;
}

export interface GetProgrammesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  search?: string;
  status?: string;
  venue_id?: string;
}

export interface PaginatedProgrammesResult extends Array<ProgrammeDoc> {
  programmes: ProgrammeDoc[];
  pagination: PaginationInfo;
  data: ProgrammeDoc[];
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
    created_at: p.created_at || p.createdAt || '',
    updated_at: p.updated_at || p.updatedAt || p.created_at || p.createdAt || '',
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
    getProgrammes: builder.query<PaginatedProgrammesResult, GetProgrammesParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {
          $comment: Date.now().toString(),
        };
        if (params && typeof params === 'object') {
          if (params.page !== undefined) queryParams.page = params.page;
          if (params.limit !== undefined) queryParams.limit = params.limit;
          if (params.status && params.status !== 'all') queryParams.status = params.status;
          if (params.searchTerm?.trim()) {
            queryParams.searchTerm = params.searchTerm.trim();
            queryParams.search = params.searchTerm.trim();
          } else if (params.search?.trim()) {
            queryParams.searchTerm = params.search.trim();
            queryParams.search = params.search.trim();
          }
          if (params.venue_id) queryParams.venue_id = params.venue_id;
        }
        return {
          url: '/programmes',
          method: 'GET',
          params: queryParams,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          cache: 'no-store',
        };
      },
      transformResponse: (response: PaginatedApiResponse<any[]> | ApiResponse<any[]>) => {
        const rawList = Array.isArray(response?.data) ? response.data : [];
        const normalized = rawList.map(normalizeProgramme);
        const pagination: PaginationInfo = (response as any)?.pagination || {
          total: normalized.length,
          limit: normalized.length || 10,
          page: 1,
          totalPage: 1,
        };
        const result = Object.assign([...normalized], {
          programmes: normalized,
          pagination,
          data: normalized,
        }) as PaginatedProgrammesResult;
        return result;
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
        cache: 'no-store',
        params: {
          $comment: Date.now().toString(),
        }
      }),
      transformResponse: (response: ApiResponse<any>) => {
        // console.log("getProgramme", response)
        return normalizeProgramme(response.data)
      },
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
        "programme-list"
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
        "programme-list"
      ],
    }),
    getProgrammeBookingCount: builder.query<number, string>({
      query: (programmeId) => ({
        url: `/programmes/booking-count/${programmeId}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<number>) =>
        typeof response.data === 'number' ? response.data : 0,
    }),
  }),
});

export const {
  useGetProgrammesQuery,
  useGetProgrammeQuery,
  useGetProgrammeBookingCountQuery,
  useCreateProgrammeMutation,
  useUpdateProgrammeMutation,
  useDuplicateProgrammeMutation,
  useDeleteProgrammeMutation,
} = programmesApi;
