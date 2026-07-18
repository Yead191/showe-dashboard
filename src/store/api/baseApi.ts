import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { toast } from 'sonner';
import type { RootState } from '@/store';
import { clearToken } from '@/store/slices/authSlice';
import { useAuthStore } from '@/store/auth.store';
import { RESET_PASSWORD_TOKEN_KEY } from '@/constants/auth-storage';

const API_PREFIX = '/api/v1';

/** Auth flows where 401 means bad credentials / OTP — not an expired session. */
const AUTH_FLOW_ENDPOINTS = new Set([
  'login',
  'forgotPassword',
  'verifyOtp',
  'resendOtp',
  'resetPassword',
]);

let sessionExpiryHandling = false;

function handleSessionExpired(api: { dispatch: (action: unknown) => void }) {
  if (sessionExpiryHandling) return;
  sessionExpiryHandling = true;

  try {
    localStorage.removeItem('token');
  } catch {
    // Ignore storage access issues.
  }

  api.dispatch(clearToken());
  useAuthStore.getState().logout();
  toast.error('Your session has expired. Please sign in again.');

  const path = window.location.pathname;
  const onAuthPage =
    path.startsWith('/login') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/verify-otp') ||
    path.startsWith('/reset-password');

  if (!onAuthPage) {
    window.location.assign('/login');
  } else {
    sessionExpiryHandling = false;
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_BASE_URL}${API_PREFIX}`,
  prepareHeaders: (headers, { getState, endpoint }) => {
    if (endpoint === 'resetPassword') {
      try {
        const resetToken =
          typeof localStorage !== 'undefined'
            ? localStorage.getItem(RESET_PASSWORD_TOKEN_KEY)
            : null;
        if (resetToken) {
          headers.set('authorization', resetToken);
        }
      } catch {
        // Ignore storage access issues in constrained browser contexts.
      }
      return headers;
    }

    const stateToken = (getState() as RootState).auth.token;
    const token =
      stateToken ??
      (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithErrorHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !AUTH_FLOW_ENDPOINTS.has(api.endpoint)) {
    handleSessionExpired(api);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'Auth',
    'Chats',
    'Notification',
    'Payment',
    'Promotions',
    'Users',
    'Controllers',
    'Events',
    'Setting',
    'ProviderOrders',
    'DashboardStats',
    'Wallet',
    'PaymentAccount',
    'Venues',
    'Recommendations',
    'SubscribedUsers',
    'Subscriptions',
    'SubscriptionPackages',
    'AddOns',
    'Activities',
    'Profile',
    'Programmes',
    'Artists',
  ],
  endpoints: () => ({}),
});

export const imageUrl = import.meta.env.VITE_API_BASE_URL;
export const socketUrl = import.meta.env.VITE_API_BASE_URL;
