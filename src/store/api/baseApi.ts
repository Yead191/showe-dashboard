import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store';
import { RESET_PASSWORD_TOKEN_KEY } from '@/constants/auth-storage';

const API_PREFIX = '/api/v1';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
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
  }),
  tagTypes: [
    'Auth',
    'Category',
    'Chats',
    'DailySafetyReports',
    'Customers',
    'Payment',
    'Notification',
    'Promotions',
    'Users',
    'Controllers',
    'Events',
    'Shops',
    'BusinessCategories',
    'HubPosts',
    'Services',
    'Products',
    'SubCategory',
    'Rooms',
    'Setting',
    'ProviderOrders',
    'DashboardStats',
    'Wallet',
    'PaymentAccount',
    'Venues',
    'SubscribedUsers',
    'SubscriptionPackages',
    'AddOns',
    'Activities',
    'Profile',
  ],
  endpoints: () => ({}),
});

export const imageUrl = import.meta.env.VITE_API_BASE_URL;
export const socketUrl = import.meta.env.VITE_API_BASE_URL;
