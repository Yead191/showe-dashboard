import { VenueImageUploader } from './VenueImageUploader';
import type { VenueFormState } from './types';

interface VenueFormFieldsProps {
  state: VenueFormState;
  update: <K extends keyof VenueFormState>(key: K, value: VenueFormState[K]) => void;
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label flex items-center gap-1">
        {label}
        {required && <span className="text-accent">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] text-ink-faint">{hint}</p>}
    </div>
  );
}

export function VenueFormFields({ state, update }: VenueFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Media */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
        <Field label="Cover image" hint="Used as the main hero on the venue card and detail page.">
          <VenueImageUploader
            value={state.cover_image}
            onChange={(f) => update('cover_image', f)}
            aspect="16/9"
            placeholder="Upload cover image"
          />
        </Field>
        <Field label="Logo">
          <VenueImageUploader
            value={state.logo}
            onChange={(f) => update('logo', f)}
            aspect="1/1"
            small
            placeholder="Logo"
          />
        </Field>
      </div>

      {/* Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Venue name" required>
          <input
            value={state.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="The Lyric Gallery"
            className="input-base"
          />
        </Field>
        <Field label="Status">
          <select
            value={state.status}
            onChange={(e) => update('status', e.target.value as VenueFormState['status'])}
            className="input-base"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={state.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="A short description shown on the venue page."
          rows={4}
          className="input-base !h-auto py-3 leading-relaxed"
        />
      </Field>

      {/* Address */}
      <div>
        <h4 className="font-display font-bold text-sm uppercase tracking-wider text-ink-muted mb-3">
          Location
        </h4>
        <div className="space-y-4">
          <Field label="Address line 1" required>
            <input
              value={state.address_line1}
              onChange={(e) => update('address_line1', e.target.value)}
              placeholder="12 Royal Crescent"
              className="input-base"
            />
          </Field>
          <Field label="Address line 2">
            <input
              value={state.address_line2}
              onChange={(e) => update('address_line2', e.target.value)}
              placeholder="Optional"
              className="input-base"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" required>
              <input
                value={state.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="Bath"
                className="input-base"
              />
            </Field>
            <Field label="State / County">
              <input
                value={state.state}
                onChange={(e) => update('state', e.target.value)}
                placeholder="Somerset"
                className="input-base"
              />
            </Field>
            <Field label="Postcode" required>
              <input
                value={state.zip_code}
                onChange={(e) => update('zip_code', e.target.value)}
                placeholder="BA1 2LR"
                className="input-base"
              />
            </Field>
            <Field label="Country" required>
              <input
                value={state.country}
                onChange={(e) => update('country', e.target.value)}
                placeholder="United Kingdom"
                className="input-base"
              />
            </Field>
          </div>
          {/* <Field label="Coordinates" hint="Latitude / longitude — used by the map embed on the detail page.">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={state.latitude}
                onChange={(e) => update('latitude', e.target.value)}
                placeholder="Latitude (e.g. 51.3873)"
                className="input-base"
              />
              <input
                value={state.longitude}
                onChange={(e) => update('longitude', e.target.value)}
                placeholder="Longitude (e.g. -2.3669)"
                className="input-base"
              />
            </div>
          </Field> */}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h4 className="font-display font-bold text-sm uppercase tracking-wider text-ink-muted mb-3">
          Contact
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Contact email" required>
              <input
                type="email"
                value={state.contact_email}
                onChange={(e) => update('contact_email', e.target.value)}
                placeholder="hello@yourvenue.co.uk"
                className="input-base"
              />
            </Field>
            <Field label="Phone">
              <input
                value={state.contact_phone}
                onChange={(e) => update('contact_phone', e.target.value)}
                placeholder="+44 1225 555 1212"
                className="input-base"
              />
            </Field>
          </div>
          <Field label="Website">
            <input
              value={state.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://yourvenue.co.uk"
              className="input-base"
            />
          </Field>
        </div>
      </div>

      {/* Branding */}
      <div>
        <h4 className="font-display font-bold text-sm uppercase tracking-wider text-ink-muted mb-3">
          Branding
        </h4>
        <Field label="Brand colour" hint="Used as the accent throughout the venue's app surfaces.">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={state.brand_color}
              onChange={(e) => update('brand_color', e.target.value)}
              className="h-11 w-14 rounded-lg border border-line cursor-pointer bg-surface-raised"
            />
            <input
              value={state.brand_color}
              onChange={(e) => update('brand_color', e.target.value)}
              placeholder="#014B52"
              className="input-base"
            />
          </div>
        </Field>
      </div>
    </div>
  );
}
