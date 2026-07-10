import { baseApi } from '@/store/api/baseApi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    role: string;
  };
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  contact: string | null;
  location: string | null;
  status: string;
  verified: boolean;
  subscription: string | null;
  isSuspended: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  suspendedDays: number | null;
  suspendedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  contact?: string;
  image?: File;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    forgotPassword: builder.mutation<{ success: boolean; message: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    verifyOtp: builder.mutation<{ success: boolean; message: string }, VerifyOtpRequest>({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    resendOtp: builder.mutation<{ success: boolean; message: string }, ResendOtpRequest>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    resetPassword: builder.mutation<{ success: boolean; message: string }, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    getProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: '/user/profile',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<UserProfile>) => response.data,
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<{ success: boolean; message: string; data: UserProfile }, UpdateProfileRequest>({
      query: ({ name, contact, image, email }) => {
        const formData = new FormData();
        if (name !== undefined) formData.append('name', name);
        if (contact !== undefined) formData.append('contact', contact);
        if (image) formData.append('image', image);
        if (email !== undefined) formData.append('email', email);

        return {
          url: '/user/profile',
          method: 'PATCH',
          body: formData,
          prepareHeaders: (headers: Headers) => {
            headers.delete('Content-Type');
            return headers;
          },
        };
      },
      invalidatesTags: ['Profile'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            authApi.util.updateQueryData('getProfile', undefined, (draft) => {
              Object.assign(draft, data.data);
            })
          );
        } catch {
          // Keep existing cache when update fails.
        }
      },
    }),
    changePassword: builder.mutation<{ success: boolean; message: string }, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'PATCH',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
