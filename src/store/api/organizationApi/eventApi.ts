import { baseApi } from '@/store/api/baseApi';
import type { EventFormState } from '@/features/events/types';
import type { EventListItem, EventStatus, Performance, PerformanceType } from '@/types/event';

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

export interface ApiEventPerformance {
  _id?: string;
  date: string;
  start_time: string;
  end_time: string;
  type: PerformanceType | string;
}

export interface ApiEventHost {
  name: string;
  email?: string;
  is_verified?: boolean;
  bio?: string;
  username?: string;
  avatar?: string;
}

export interface ApiEventSocial {
  share_url?: string;
  share_text?: string;
  views_count?: number;
}

export interface ApiEvent {
  _id: string;
  title: string;
  category: string;
  is_featured: boolean;
  tags?: string[];
  author?: string;
  cover_image?: string;
  gallery?: string[];
  description_html?: string;
  highlights?: string[];
  get_tickets_url?: string;
  performances: ApiEventPerformance[];
  price?: number;
  event_date?: string;
  vanue?: string;
  programme?: string | null;
  nearby_restaurants?: string[];
  nearby_hotels?: string[];
  nearby_bars?: string[];
  status: EventStatus | string;
  host?: ApiEventHost;
  social?: ApiEventSocial;
  address?: string;
  qr_scan_count?: number;
  interest_count?: number;
  downloads_count?: number;
  revinge_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
}

export interface GetEventsResult {
  events: ApiEvent[];
  pagination: PaginatedApiResponse<ApiEvent[]>['pagination'];
}

export interface CreateEventArgs {
  title: string;
  category: string;
  is_featured: boolean;
  tags: string[];
  description_html?: string;
  status: string;
  highlights: string[];
  get_tickets_url?: string;
  performances: Array<{
    date: string;
    start_time: string;
    end_time: string;
    type: string;
  }>;
  host: ApiEventHost;
  vanue: string;
  programme?: string;
  social?: ApiEventSocial;
  nearby_restaurants?: string[];
  nearby_hotels?: string[];
  nearby_bars?: string[];
  cover_image?: File;
  gallery?: File[];
  price?: number | string;
  event_date?: string;
}

export interface UpdateEventArgs extends CreateEventArgs {
  id: string;
}

function appendArrayField(formData: FormData, key: string, values: string[]) {
  values.forEach((value) => {
    if (value) formData.append(key, value);
  });
}

export function buildEventFormData(args: CreateEventArgs): FormData {
  const formData = new FormData();

  formData.append('title', args.title);
  formData.append('category', args.category);
  formData.append('is_featured', String(args.is_featured));
  formData.append('description_html', args.description_html ?? '');
  formData.append('status', args.status);
  formData.append('get_tickets_url', args.get_tickets_url ?? '');
  formData.append('performances', JSON.stringify(args.performances));
  formData.append('host', JSON.stringify(args.host));
  formData.append('vanue', args.vanue);
  formData.append('social', JSON.stringify(args.social ?? {}));
  formData.append('price', String(args.price ?? 0));
  if (args.event_date) formData.append('event_date', args.event_date);
  if (args.programme) formData.append('programme', args.programme);

  appendArrayField(formData, 'tags[]', args.tags);
  appendArrayField(formData, 'highlights[]', args.highlights);
  appendArrayField(formData, 'nearby_restaurants[]', args.nearby_restaurants ?? []);
  appendArrayField(formData, 'nearby_hotels[]', args.nearby_hotels ?? []);
  appendArrayField(formData, 'nearby_bars[]', args.nearby_bars ?? []);

  if (args.cover_image) {
    formData.append('cover_image', args.cover_image);
  }
  (args.gallery ?? []).forEach((file) => {
    formData.append('gallery', file);
  });

  return formData;
}

function toPerformanceDate(date: string): string {
  if (!date) return '';
  if (date.includes('T')) return date;
  return `${date}T00:00:00.000Z`;
}

export function mapApiEventToEventListItem(api: ApiEvent): EventListItem {
  const performances: Performance[] = (api.performances ?? []).map((p, index) => ({
    id: p._id ?? `p${index}`,
    date: (p.date ?? '').slice(0, 10),
    start_time: p.start_time,
    end_time: p.end_time,
    type: (p.type as PerformanceType) || 'evening',
  }));

  return {
    id: api._id,
    venue_id: api.vanue ?? '',
    venue_name: api.address || 'Venue',
    title: api.title,
    slug: api.title.toLowerCase().replace(/\s+/g, '-'),
    category: api.category,
    cover_image: api.cover_image ?? '',
    status: (api.status as EventStatus) || 'draft',
    is_featured: Boolean(api.is_featured),
    performances:
      performances.length > 0
        ? performances
        : [{ id: 'p1', date: '', start_time: '19:30', end_time: '21:30', type: 'evening' }],
    location_city: api.address || '—',
    programme_id: api.programme ?? null,
    qr_scans: api.qr_scan_count ?? 0,
    programme_downloads: api.downloads_count ?? 0,
    revenue: api.revinge_count ?? 0,
    created_at: api.createdAt,
    updated_at: api.updatedAt,
  };
}

export function mapApiEventToFormState(api: ApiEvent): EventFormState {
  return {
    title: api.title,
    category: api.category || 'Theater',
    tags: api.tags ?? [],
    cover_image: api.cover_image ?? null,
    gallery: api.gallery ?? [],
    is_featured: Boolean(api.is_featured),
    description_html: api.description_html ?? '',
    highlights: api.highlights ?? [],
    get_tickets_url: api.get_tickets_url ?? '',
    status: (api.status as EventStatus) || 'published',
    price: api.price ?? 0,
    performances: (api.performances ?? []).map((p, index) => ({
      id: p._id ?? `p${index}`,
      date: (p.date ?? '').slice(0, 10),
      start_time: p.start_time,
      end_time: p.end_time,
      type: (p.type as PerformanceType) || 'evening',
    })),
    venue_id: api.vanue ?? null,
    venue_name: api.address || '',
    address_line1: api.address || '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United Kingdom',
    latitude: '',
    longitude: '',
    host_name: api.host?.name ?? '',
    host_username: api.host?.username ?? api.host?.email ?? '',
    host_bio: api.host?.bio ?? '',
    host_avatar: api.host?.avatar ?? null,
    host_verified: Boolean(api.host?.is_verified),
    selected_restaurants: api.nearby_restaurants ?? [],
    selected_hotels: api.nearby_hotels ?? [],
    selected_bars: api.nearby_bars ?? [],
    linked_programme_id: api.programme ?? null,
  };
}

export function eventFormStateToCreateArgs(state: EventFormState): CreateEventArgs {
  const performances = state.performances
    .filter((p) => p.date && p.start_time && p.end_time)
    .map((p) => ({
      date: toPerformanceDate(p.date),
      start_time: p.start_time,
      end_time: p.end_time,
      type: p.type,
    }));

  const eventDate =
    performances.length > 0
      ? performances[performances.length - 1].date
      : undefined;

  const galleryFiles = state.gallery.filter((item): item is File => item instanceof File);

  return {
    title: state.title.trim(),
    category: state.category,
    is_featured: state.is_featured,
    tags: state.tags,
    description_html: state.description_html.trim()
      ? state.description_html.includes('<')
        ? state.description_html
        : `<p>${state.description_html}</p>`
      : '',
    status: state.status,
    highlights: state.highlights,
    get_tickets_url: state.get_tickets_url.trim() || undefined,
    performances,
    host: {
      name: state.host_name.trim() || 'Event Host',
      email: state.host_username.trim() || undefined,
      is_verified: state.host_verified,
      bio: state.host_bio.trim() || undefined,
    },
    vanue: state.venue_id ?? '',
    programme: state.linked_programme_id ?? undefined,
    social: {
      share_url: state.get_tickets_url.trim() || undefined,
      share_text: state.title.trim()
        ? `Join us for ${state.title.trim()}!`
        : undefined,
      views_count: 0,
    },
    nearby_restaurants: state.selected_restaurants,
    nearby_hotels: state.selected_hotels,
    nearby_bars: state.selected_bars,
    cover_image: state.cover_image instanceof File ? state.cover_image : undefined,
    gallery: galleryFiles,
    price: state.price,
    event_date: eventDate,
  };
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationEvents: builder.query<GetEventsResult, GetEventsParams | void>({
      query: (params) => ({
        url: '/event',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          ...(params?.searchTerm?.trim()
            ? { searchTerm: params.searchTerm.trim() }
            : {}),
          ...(params?.status ? { status: params.status } : {}),
        },
      }),
      transformResponse: (response: PaginatedApiResponse<ApiEvent[]>) => ({
        events: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.events.map(({ _id }) => ({ type: 'Events' as const, id: _id })),
              { type: 'Events', id: 'LIST' },
            ]
          : [{ type: 'Events', id: 'LIST' }],
    }),
    getOrganizationEvent: builder.query<ApiEvent, string>({
      query: (id) => ({
        url: `/event/${id}`,
      }),
      transformResponse: (response: ApiResponse<ApiEvent>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Events', id }],
    }),
    createOrganizationEvent: builder.mutation<
      { success: boolean; message: string },
      CreateEventArgs
    >({
      query: (args) => ({
        url: '/event',
        method: 'POST',
        body: buildEventFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: [{ type: 'Events', id: 'LIST' }],
    }),
    updateOrganizationEvent: builder.mutation<
      { success: boolean; message: string },
      UpdateEventArgs
    >({
      query: ({ id, ...args }) => ({
        url: `/event/${id}`,
        method: 'PATCH',
        body: buildEventFormData(args),
        prepareHeaders: (headers: Headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
      ],
    }),
    deleteOrganizationEvent: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/event/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetOrganizationEventsQuery,
  useGetOrganizationEventQuery,
  useCreateOrganizationEventMutation,
  useUpdateOrganizationEventMutation,
  useDeleteOrganizationEventMutation,
} = eventsApi;
