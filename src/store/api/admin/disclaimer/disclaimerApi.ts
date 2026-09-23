import { baseApi } from "@/store/api/baseApi";
import type {
  DisclaimerMutationResponse,
  DisclaimerResponse,
  GetDisclaimerParams,
  UpsertDisclaimerPayload,
} from "./disclaimer.types";

export const disclaimerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDisclaimer: builder.query<DisclaimerResponse, GetDisclaimerParams>({
      query: ({ type }) => ({
        url: "/disclaimer",
        method: "GET",
        params: { type },
      }),
      providesTags: (_res, _err, arg) => [{ type: "Disclaimer", id: arg.type }],
    }),

    upsertDisclaimer: builder.mutation<
      DisclaimerMutationResponse,
      UpsertDisclaimerPayload
    >({
      query: (body) => ({
        url: "/disclaimer",
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "Disclaimer", id: arg.type },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDisclaimerQuery, useUpsertDisclaimerMutation } =
  disclaimerApi;
