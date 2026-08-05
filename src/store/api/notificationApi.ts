import { baseApi } from '@/store/api/baseApi';

export interface SendPushNotificationPayload {
  target: string;
  event?: string;
  performance?: string;
  /** Backend spelling for programme id. */
  proggramme?: string;
  vanue?: string;
  title: string;
  message: string;
  filePath?: string;
  extraPath?: string;
  is_schedule_notification?: boolean;
  schedule_time?: Date | string;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendPushNotification: builder.mutation<{ success: boolean; message: string }, SendPushNotificationPayload>({
      query: (body) => ({
        url: '/notification/send-push-notification',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const { useSendPushNotificationMutation } = notificationApi;
