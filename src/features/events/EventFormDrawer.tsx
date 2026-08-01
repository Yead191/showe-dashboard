import { useState, useCallback, useEffect, useMemo } from 'react';
import { Tabs, Button, Spin, Tooltip } from 'antd';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import type { EventListItem } from '@/types/event';
import {
  eventFormStateToCreateArgs,
  mapApiEventToFormState,
  useCreateOrganizationEventMutation,
  useGetOrganizationEventQuery,
  useUpdateOrganizationEventMutation,
} from '@/store/api/organizationApi/eventApi';
import { useGetProfileQuery } from '@/store/api/authApi';
import { isModuleUnlocked } from '@/constants/module-blocks';

import { BasicsTab } from './components/BasicsTab';
import { MediaTab } from './components/MediaTab';
import { ScheduleTab } from './components/ScheduleTab';
import { VenueTab } from './components/VenueTab';
import { ArtistTab } from './components/ArtistTab';
import { RecommendationsTab } from './components/RecommendationsTab';
import { ProgrammesTab } from './components/ProgrammesTab';
import { DEFAULT_STATE, type EventFormState } from './types';

interface EventFormDrawerProps {
  event: EventListItem | null;
  onSave: () => void;
  onCancel: () => void;
}

const RECOMMENDATIONS_MODULE = 8;

const BASE_TABS = [
  { key: 'basics', label: 'Basics' },
  { key: 'media', label: 'Media' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'venue', label: 'Venue' },
  { key: 'artist', label: 'Artist' },
  { key: 'recommendations', label: 'Recommendations' },
  { key: 'programmes', label: 'Programmes' },
];

export function EventFormDrawer({ event, onSave, onCancel }: EventFormDrawerProps) {
  const [tab, setTab] = useState('basics');
  const [state, setState] = useState<EventFormState>(DEFAULT_STATE);

  const { data: profile } = useGetProfileQuery();
  const recommendationsLocked = !isModuleUnlocked(
    RECOMMENDATIONS_MODULE,
    profile?.subscription?.modules
  );

  const tabItems = useMemo(
    () =>
      BASE_TABS.map((item) => {
        if (item.key !== 'recommendations' || !recommendationsLocked) {
          return item;
        }
        return {
          ...item,
          disabled: true,
          label: (
            <Tooltip
              title="Locked — Module 8 is not included in your subscription. Upgrade to unlock Recommendations."
            >
              <span className="inline-flex items-center gap-1.5 pointer-events-auto">
                Recommendations
                <Lock size={12} className="opacity-70" />
              </span>
            </Tooltip>
          ),
        };
      }),
    [recommendationsLocked]
  );

  const { data: apiEvent, isLoading: isEventLoading } = useGetOrganizationEventQuery(
    event?.id ?? '',
    { skip: !event?.id }
  );
  const [createEvent, { isLoading: isCreating }] = useCreateOrganizationEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateOrganizationEventMutation();
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (recommendationsLocked && tab === 'recommendations') {
      setTab('basics');
    }
  }, [recommendationsLocked, tab]);

  useEffect(() => {
    if (!event) {
      setState(DEFAULT_STATE);
      return;
    }
    if (apiEvent) {
      setState(mapApiEventToFormState(apiEvent));
    }
  }, [event, apiEvent]);

  const update = useCallback(<K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!state.title.trim()) {
      toast.error('Event title is required.');
      setTab('basics');
      return;
    }
    if (!state.venue_id) {
      toast.error('Please select a venue.');
      setTab('venue');
      return;
    }
    if (!state.cover_image && !event) {
      toast.error('Please upload a cover image.');
      setTab('media');
      return;
    }
    if (state.performances.every((p) => !p.date)) {
      toast.error('Please add at least one performance date.');
      setTab('schedule');
      return;
    }
    if (!state.artist_id) {
      toast.error('Please select an artist.');
      setTab('artist');
      return;
    }

    const payload = eventFormStateToCreateArgs(state);

    try {
      if (event) {
        const result = await updateEvent({ id: event.id, ...payload }).unwrap();
        toast.success(result.message || 'Event updated successfully.');
      } else {
        const result = await createEvent(payload).unwrap();
        toast.success(result.message || 'Event created successfully.');
      }
      onSave();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message || (event ? 'Failed to update event.' : 'Failed to create event.'));
    }
  };

  if (event && isEventLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F6F4EF]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F6F4EF]">
      <div className="px-6 pt-3 bg-surface-base border-b border-line sticky top-0 z-10">
        <Tabs activeKey={tab} onChange={setTab} items={tabItems} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {tab === 'basics' && <BasicsTab state={state} update={update} />}
          {tab === 'media' && <MediaTab state={state} update={update} />}
          {tab === 'schedule' && <ScheduleTab state={state} update={update} />}
          {tab === 'venue' && <VenueTab state={state} update={update} />}
          {tab === 'artist' && <ArtistTab state={state} update={update} />}
          {tab === 'recommendations' && !recommendationsLocked && (
            <RecommendationsTab state={state} update={update} />
          )}
          {tab === 'programmes' && <ProgrammesTab state={state} update={update} />}
        </div>
      </div>

      <div className="px-6 py-4 bg-surface-raised border-t border-line flex items-center justify-between">
        <div className="text-[12.5px] text-ink-muted">
          {event ? 'Editing existing event' : 'Creating a new event'}
        </div>
        <div className="flex gap-2">
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="primary" onClick={() => void handleSave()} loading={isSubmitting}>
            {event ? 'Save changes' : 'Create event'}
          </Button>
        </div>
      </div>
    </div>
  );
}
