import { baseApi } from './baseApi';

export interface NotificationItem {
  _id: string;
  title: string;
  receiver: string[];
  message: string;
  filePath?: string;
  isRead: boolean;
  readers: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: {
    unreadCount: number;
    data: Array<
      Omit<NotificationItem, 'isRead'> & {
        isRead?: boolean;
        is_read?: boolean;
      }
    >;
  };
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
}

export interface GetNotificationsResult {
  items: NotificationItem[];
  unreadCount: number;
  pagination: NotificationsResponse['pagination'];
}

const DEFAULT_LIMIT = 10;

function normalizeNotification(
  item: NotificationsResponse['data']['data'][number],
): NotificationItem {
  return {
    _id: item._id,
    title: item.title,
    receiver: item.receiver ?? [],
    message: item.message,
    filePath: item.filePath,
    // Prefer API `isRead`; fall back to snake_case if present.
    isRead: Boolean(item.isRead ?? item.is_read),
    readers: item.readers ?? [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<GetNotificationsResult, GetNotificationsParams | void>({
      query: (params) => ({
        url: '/notification',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? DEFAULT_LIMIT,
        },
      }),
      transformResponse: (response: NotificationsResponse): GetNotificationsResult => {
        const items = (response.data?.data ?? []).map(normalizeNotification);
        const unreadFromItems = items.filter((item) => !item.isRead).length;
        return {
          items,
          unreadCount: response.data?.unreadCount ?? unreadFromItems,
          pagination: response.pagination ?? {
            total: 0,
            limit: DEFAULT_LIMIT,
            page: 1,
            totalPage: 1,
          },
        };
      },
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        const page = arg?.page ?? 1;
        if (page <= 1) {
          currentCache.items = newItems.items;
        } else {
          const existingIds = new Set(currentCache.items.map((item) => item._id));
          for (const item of newItems.items) {
            if (!existingIds.has(item._id)) {
              currentCache.items.push(item);
            }
          }
        }
        currentCache.unreadCount = newItems.unreadCount;
        currentCache.pagination = newItems.pagination;
      },
      forceRefetch({ currentArg, previousArg }) {
        return (currentArg?.page ?? 1) !== (previousArg?.page ?? 1);
      },
      providesTags: ['Notification'],
    }),
    readNotification: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/notification/${id}`,
        method: 'PATCH',
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationApi.util.updateQueryData(
            'getNotifications',
            { page: 1, limit: DEFAULT_LIMIT },
            (draft) => {
              const item = draft.items.find((n) => n._id === id);
              if (item && item.isRead === false) {
                item.isRead = true;
                draft.unreadCount = Math.max(0, draft.unreadCount - 1);
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Notification'],
    }),
    readAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: `/notification`,
        method: 'PATCH',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationApi.util.updateQueryData(
            'getNotifications',
            { page: 1, limit: DEFAULT_LIMIT },
            (draft) => {
              draft.items.forEach((item) => {
                item.isRead = true;
              });
              draft.unreadCount = 0;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Notification'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useReadNotificationMutation,
  useReadAllNotificationsMutation,
} = notificationApi;

export default notificationApi;
