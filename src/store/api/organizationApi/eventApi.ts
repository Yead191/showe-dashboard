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

export interface ApiEventArtist {
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  image?: string;
  cover_image?: string;
}

export interface ApiEventVenueRef {
  _id?: string;
  id?: string;
  name?: string;
  address_line1?: string;
  city?: string;
  address?: string;
}

export interface ApiEventRef {
  _id?: string;
  id?: string;
  name?: string;
}

/** API may return a plain id or a populated document. */
export type ApiIdOrRef = string | ApiEventRef | ApiEventVenueRef | null | undefined;

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
  vanue?: ApiIdOrRef;
  programme?: ApiIdOrRef;
  nearby_restaurants?: ApiIdOrRef[];
  nearby_hotels?: ApiIdOrRef[];
  nearby_bars?: ApiIdOrRef[];
  status: EventStatus | string;
  host?: ApiEventHost;
  /** Artist id, or populated artist object from API. */
  artist?: string | ApiEventArtist;
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
  /** Organisation artist document id. */
  artist: string;
  /** Backend still requires host JSON even though the UI no longer collects it. */
  host?: ApiEventHost;
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

const DEFAULT_EVENT_HOST: ApiEventHost = {
  name: 'Event Host',
  is_verified: false,
};

/**
 * Normalize id refs from API (plain string or populated `{ _id }` / `{ id }`).
 * Avoids FormData sending "[object Object]".
 */
function toPlainObjectId(value: unknown): string {
  if (value == null || value === '') return '';

  if (typeof value === 'object') {
    const ref = value as { _id?: unknown; id?: unknown };
    if (ref._id != null) return toPlainObjectId(ref._id);
    if (ref.id != null) return toPlainObjectId(ref.id);
    return '';
  }

  let id = String(value).trim();
  if (!id || id === '[object Object]') return '';

  while (
    (id.startsWith('"') && id.endsWith('"')) ||
    (id.startsWith("'") && id.endsWith("'"))
  ) {
    id = id.slice(1, -1).trim();
  }

  return id === '[object Object]' ? '' : id;
}

function toPlainObjectIdList(values: unknown[] | undefined): string[] {
  if (!values?.length) return [];
  return values.map(toPlainObjectId).filter(Boolean);
}

function appendArrayField(formData: FormData, key: string, values: string[]) {
  values.forEach((value) => {
    const id = toPlainObjectId(value);
    if (id) formData.append(key, id);
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
  formData.append('host', JSON.stringify(args.host ?? DEFAULT_EVENT_HOST));
  // Plain id string — do not JSON.stringify (that wraps the id in quotes).
  formData.append('artist', toPlainObjectId(args.artist));
  formData.append('vanue', toPlainObjectId(args.vanue));
  formData.append('social', JSON.stringify(args.social ?? {}));
  formData.append('price', String(args.price ?? 0));
  if (args.event_date) formData.append('event_date', args.event_date);
  if (args.programme) formData.append('programme', toPlainObjectId(args.programme));

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

  const venueId = toPlainObjectId(api.vanue);
  const venueName =
    typeof api.vanue === 'object' && api.vanue && 'name' in api.vanue
      ? (api.vanue.name ?? api.address ?? 'Venue')
      : api.address || 'Venue';

  return {
    id: api._id,
    venue_id: venueId,
    venue_name: venueName || 'Venue',
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
    programme_id: toPlainObjectId(api.programme) || null,
    qr_scans: api.qr_scan_count ?? 0,
    programme_downloads: api.downloads_count ?? 0,
    revenue: api.revinge_count ?? 0,
    created_at: api.createdAt,
    updated_at: api.updatedAt,
  };
}

export function mapApiEventToFormState(api: ApiEvent): EventFormState {
  const artistId =
    typeof api.artist === 'string'
      ? toPlainObjectId(api.artist)
      : toPlainObjectId(api.artist) || null;

  const venueId = toPlainObjectId(api.vanue) || null;
  const venueObj =
    typeof api.vanue === 'object' && api.vanue ? (api.vanue as ApiEventVenueRef) : null;

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
    venue_id: venueId,
    venue_name: venueObj?.name ?? api.address ?? '',
    address_line1: venueObj?.address_line1 ?? api.address ?? '',
    address_line2: '',
    city: venueObj?.city ?? '',
    state: '',
    zip_code: '',
    country: 'United Kingdom',
    latitude: '',
    longitude: '',
    artist_id: artistId || null,
    selected_restaurants: toPlainObjectIdList(api.nearby_restaurants),
    selected_hotels: toPlainObjectIdList(api.nearby_hotels),
    selected_bars: toPlainObjectIdList(api.nearby_bars),
    linked_programme_id: toPlainObjectId(api.programme) || null,
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
    artist: toPlainObjectId(state.artist_id),
    host: DEFAULT_EVENT_HOST,
    vanue: toPlainObjectId(state.venue_id),
    programme: toPlainObjectId(state.linked_programme_id) || undefined,
    social: {
      share_url: state.get_tickets_url.trim() || undefined,
      share_text: state.title.trim()
        ? `Join us for ${state.title.trim()}!`
        : undefined,
      views_count: 0,
    },
    nearby_restaurants: toPlainObjectIdList(state.selected_restaurants),
    nearby_hotels: toPlainObjectIdList(state.selected_hotels),
    nearby_bars: toPlainObjectIdList(state.selected_bars),
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
