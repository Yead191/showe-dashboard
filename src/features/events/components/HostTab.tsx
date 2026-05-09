import { Switch } from 'antd';
import { FieldGroup } from './FieldGroup';
import { ImageUploader } from './ImageUploader';
import type { EventFormState } from '../types';

interface HostTabProps {
  state: EventFormState;
  update: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

export function HostTab({ state, update }: HostTabProps) {
  return (
    <div className="space-y-6">
      <FieldGroup label="Host avatar">
        <ImageUploader
          value={state.host_avatar}
          onChange={(v) => update('host_avatar', v)}
          aspect="1/1"
          small
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Host name">
          <input
            value={state.host_name}
            onChange={(e) => update('host_name', e.target.value)}
            placeholder="Mara Sinclair"
            className="input-base"
          />
        </FieldGroup>
        <FieldGroup label="Username / handle">
          <input
            value={state.host_username}
            onChange={(e) => update('host_username', e.target.value)}
            placeholder="maradirects"
            className="input-base"
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Host bio">
        <textarea
          value={state.host_bio}
          onChange={(e) => update('host_bio', e.target.value)}
          rows={3}
          placeholder="Director, producer, or organiser bio."
          className="input-base !h-auto py-3 leading-relaxed"
        />
      </FieldGroup>

      <FieldGroup label="Verified host" hint="Show a verified tick on the event page.">
        <Switch
          checked={state.host_verified}
          onChange={(v) => update('host_verified', v)}
        />
      </FieldGroup>
    </div>
  );
}
