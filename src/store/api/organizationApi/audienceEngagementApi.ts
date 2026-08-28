import { baseApi } from '@/store/api/baseApi';

export interface UserThoughtUser {
  _id: string;
  name: string;
  image?: string;
}

export interface UserThought {
  _id: string;
  user: UserThoughtUser;
  thought: string;
  is_archived: boolean;
  is_read: boolean;
  proggrame?: string | { _id: string; title?: string; name?: string };
  createdAt: string;
  updatedAt: string;
}

export interface GetUserThoughtsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  programme?: string;
}

export interface GetUserThoughtsResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: UserThought[];
}

export interface ProgrammeAnalytics {
  totalPoll: number;
  totalPollAnswer: number;
  totalUserThoughts: number;
}

export interface ProgrammePoll {
  _id: string;
  programme: string;
  question: string;
  id: string;
  response: number;
  status?: 'active' | 'closed';
  closedAt?: string;
  resultsAvailableAt?: string;
}

export interface PollAnswer {
  answer_id: string;
  answer: string;
  count: number;
  percentage: number;
}

export const audienceEngagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserThoughts: builder.query<GetUserThoughtsResponse, GetUserThoughtsParams | void>({
      query: (params) => {
        const progId = params?.programme;
        // Supports both /programmes/user-thoughts/:id and /programmes/user-thoughts query params
        const url = progId ? `/programmes/user-thoughts/${progId}` : '/programmes/user-thoughts';
        return {
          url,
          method: 'GET',
          params: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 10,
            ...(params?.searchTerm?.trim() ? { searchTerm: params.searchTerm.trim() } : {}),
            ...(params?.status && params.status !== 'all' ? { status: params.status } : {}),
            ...(params?.programme ? { programme: params.programme } : {}),
          },
        };
      },
      providesTags: ['UserThoughts'],
    }),

    getProggramAnalytics: builder.query<{ success: boolean; message: string; data: ProgrammeAnalytics }, string>({
      query: (id) => ({
        url: `/programmes/polls-thoughts-analytics/${id}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'ProgrammeAnalytics', id }],
    }),

    getPollsByProgram: builder.query<{ success: boolean; message: string; data: ProgrammePoll[] }, string>({
      query: (id) => ({
        url: `/programmes/polls/${id}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'ProgrammePolls', id }],
    }),

    getPollAnswerByProgram: builder.query<{ success: boolean; message: string; data: PollAnswer[] }, string>({
      query: (id) => ({
        url: `/programmes/polls/${id}/answers`,
        method: 'GET',
      }),
      providesTags: (_res, _err, id) => [{ type: 'PollAnswers', id }],
    }),
  }),
});

export const {
  useGetUserThoughtsQuery,
  useGetProggramAnalyticsQuery,
  useGetPollsByProgramQuery,
  useGetPollAnswerByProgramQuery,
} = audienceEngagementApi;

 