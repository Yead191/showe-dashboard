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

      <div className="border-t border-line pt-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-ink">Artist</h3>
          <p className="text-[12.5px] text-ink-muted mt-0.5">
            Featured artist details shown on the event page.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Artist name" required>
            <input
              value={state.artist_name}
              onChange={(e) => update('artist_name', e.target.value)}
              placeholder="Ariana Blake"
              className="input-base"
            />
          </FieldGroup>
          <FieldGroup label="Artist category">
            <input
              value={state.artist_category}
              onChange={(e) => update('artist_category', e.target.value)}
              placeholder="Contemporary Art"
              className="input-base"
            />
          </FieldGroup>
        </div>

        <FieldGroup label="Artist description">
          <textarea
            value={state.artist_description}
            onChange={(e) => update('artist_description', e.target.value)}
            rows={3}
            placeholder="A short bio about the featured artist."
            className="input-base !h-auto py-3 leading-relaxed"
          />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Artist image">
            <ImageUploader
              value={state.artist_image}
              onChange={(v) => update('artist_image', v)}
              aspect="1/1"
            />
          </FieldGroup>
          <FieldGroup label="Artist cover image">
            <ImageUploader
              value={state.artist_cover_image}
              onChange={(v) => update('artist_cover_image', v)}
              aspect="16/9"
            />
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}
