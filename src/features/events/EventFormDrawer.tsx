import { useState, useCallback } from 'react';
import { Tabs, Button } from 'antd';
import type { EventListItem } from '@/types/event';

import { BasicsTab } from './components/BasicsTab';
import { MediaTab } from './components/MediaTab';
import { ScheduleTab } from './components/ScheduleTab';
import { VenueTab } from './components/VenueTab';
import { HostTab } from './components/HostTab';
import { RecommendationsTab } from './components/RecommendationsTab';
import { ProgrammesTab } from './components/ProgrammesTab';
import { DEFAULT_STATE, type EventFormState } from './types';

interface EventFormDrawerProps {
  event: EventListItem | null;
  onSave: () => void;
  onCancel: () => void;
}

const TABS = [
  { key: 'basics', label: 'Basics' },
  { key: 'media', label: 'Media' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'venue', label: 'Venue' },
  { key: 'host', label: 'Host & social' },
  { key: 'recommendations', label: 'Recommendations' },
  { key: 'programmes', label: 'Programmes' },
];

export function EventFormDrawer({ event, onSave, onCancel }: EventFormDrawerProps) {
  const [tab, setTab] = useState('basics');
  const [state, setState] = useState<EventFormState>(() => {
    if (!event) return DEFAULT_STATE;
    // Note: In a real app, you might fetch full EventDetails here or pass it as prop
    // For now, we populate what we have from EventListItem
    return {
      ...DEFAULT_STATE,
      title: event.title,
      category: event.category,
      cover_image: event.cover_image,
      is_featured: event.is_featured,
      performances: event.performances,
      venue_name: event.venue_name,
      city: event.location_city,
      linked_programme_id: event.programme_id ?? null,
    };
  });

  const update = useCallback(<K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const handleSave = () => {
    // Construct FormData
    const formData = new FormData();

    Object.entries(state).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (key === 'cover_image' || key === 'host_avatar') {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'string') {
          formData.append(key, value);
        }
      } else if (key === 'gallery') {
        (value as (string | File)[]).forEach((item, index) => {
          formData.append(`gallery[${index}]`, item);
        });
      } else if (Array.isArray(value)) {
        // For simple arrays or objects like performances/tags
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    // Simulate API call
    setTimeout(() => {
      onSave();
    }, 500);
  };

  return (
    <div className="h-full flex flex-col bg-[#F6F4EF]">
      {/* Tabs header — sticky */}
      <div className="px-6 pt-3 bg-surface-base border-b border-line sticky top-0 z-10">
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={TABS}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {tab === 'basics' && <BasicsTab state={state} update={update} />}
          {tab === 'media' && <MediaTab state={state} update={update} />}
          {tab === 'schedule' && <ScheduleTab state={state} update={update} />}
          {tab === 'venue' && <VenueTab state={state} update={update} />}
          {tab === 'host' && <HostTab state={state} update={update} />}
          {tab === 'recommendations' && <RecommendationsTab state={state} update={update} />}
          {tab === 'programmes' && <ProgrammesTab state={state} update={update} />}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-surface-raised border-t border-line flex items-center justify-between">
        <div className="text-[12.5px] text-ink-muted">
          {event ? 'Editing existing event' : 'Creating a new event'}
        </div>
        <div className="flex gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            {event ? 'Save changes' : 'Create event'}
          </Button>
        </div>
      </div>
    </div>
  );
}
