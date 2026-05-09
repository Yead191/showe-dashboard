import { MapPin } from 'lucide-react';
import { FieldGroup } from './FieldGroup';
import type { EventFormState } from '../types';

interface LocationTabProps {
  state: EventFormState;
  update: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

export function LocationTab({ state, update }: LocationTabProps) {
  return (
    <div className="space-y-6">
      <FieldGroup label="Venue name">
        <input
          value={state.venue_name}
          onChange={(e) => update('venue_name', e.target.value)}
          placeholder="Royal Crescent Theatre"
          className="input-base"
        />
      </FieldGroup>

      <FieldGroup label="Address">
        <input
          value={state.address_line1}
          onChange={(e) => update('address_line1', e.target.value)}
          placeholder="Address line 1"
          className="input-base mb-2"
        />
        <input
          value={state.address_line2}
          onChange={(e) => update('address_line2', e.target.value)}
          placeholder="Address line 2 (optional)"
          className="input-base"
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="City">
          <input
            value={state.city}
            onChange={(e) => update('city', e.target.value)}
            className="input-base"
          />
        </FieldGroup>
        <FieldGroup label="State / County">
          <input
            value={state.state}
            onChange={(e) => update('state', e.target.value)}
            className="input-base"
          />
        </FieldGroup>
        <FieldGroup label="Postcode">
          <input
            value={state.zip_code}
            onChange={(e) => update('zip_code', e.target.value)}
            className="input-base"
          />
        </FieldGroup>
        <FieldGroup label="Country">
          <input
            value={state.country}
            onChange={(e) => update('country', e.target.value)}
            className="input-base"
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Coordinates" hint="Used by Module 10 — Getting There">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <MapPin
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
            />
            <input
              value={state.latitude}
              onChange={(e) => update('latitude', e.target.value)}
              placeholder="51.3873"
              className="input-base pl-9"
            />
          </div>
          <input
            value={state.longitude}
            onChange={(e) => update('longitude', e.target.value)}
            placeholder="-2.3669"
            className="input-base"
          />
        </div>
      </FieldGroup>
    </div>
  );
}
