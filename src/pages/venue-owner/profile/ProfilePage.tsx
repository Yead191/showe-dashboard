import { useState } from 'react';
import { Button } from 'antd';
import { Image as ImageIcon, MapPin, Mail, Globe, Phone, Save, Pipette } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, } from '@/components/ui';
import { useScopedVenueData } from '@/hooks/useScopedVenueData';

export default function ProfilePage() {
  const { activeVenue, isAggregate, venues } = useScopedVenueData();
  const venue = activeVenue ?? venues[0];

  const [saved, setSaved] = useState(false);

  if (!venue) return null;

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Venue profile"
        description={
          isAggregate
            ? `You’re editing ${venue.name}. Switch venues from the top bar to edit a different one.`
            : `Editing ${venue.name}.`
        }
        actions={
          <Button
            type="primary"
            icon={<Save size={14} />}
            onClick={() => {
              toast.success('Profile saved.');
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel className="lg:col-span-2" title="Venue branding" description="How your venue appears to audiences in the SHOWE app.">
          <div className="space-y-5">
            <div>
              <label className="field-label">Cover image</label>
              <div className="relative rounded-xl overflow-hidden border border-line aspect-[16/6]">
                <img src={venue.cover_image} alt="" className="w-full h-full object-cover" />
                <button className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-white/95 backdrop-blur text-sm font-semibold text-ink hover:bg-white transition-colors">
                  <ImageIcon size={13} /> Change
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Venue name</label>
                <input className="input-base" defaultValue={venue.name} />
              </div>
              <div>
                <label className="field-label">Brand colour</label>
                <div className="flex gap-2">
                  <div
                    className="w-11 h-11 rounded-lg border border-line shrink-0"
                    style={{ background: venue.brand_color ?? '#014B52' }}
                  />
                  <div className="relative flex-1">
                    <Pipette size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                    <input className="input-base pl-9" defaultValue={venue.brand_color ?? '#014B52'} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="field-label">Description</label>
              <textarea
                rows={4}
                defaultValue={venue.description}
                className="input-base !h-auto py-3 leading-relaxed"
                placeholder="A short paragraph about your venue."
              />
            </div>
          </div>
        </Panel>

        <Panel title="Contact & links">
          <div className="space-y-4">
            <FieldWithIcon icon={Mail} label="Contact email" defaultValue={venue.contact_email} />
            <FieldWithIcon icon={Phone} label="Contact phone" defaultValue={venue.contact_phone ?? ''} />
            <FieldWithIcon icon={Globe} label="Website" defaultValue={venue.website ?? ''} />
          </div>
        </Panel>

        <Panel className="lg:col-span-3" title="Location" description="Used for QR scans, recommendations and Module 10.">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <FieldWithIcon icon={MapPin} label="Address" defaultValue={venue.address_line1} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">City</label>
                  <input className="input-base" defaultValue={venue.city} />
                </div>
                <div>
                  <label className="field-label">Postcode</label>
                  <input className="input-base" defaultValue={venue.zip_code} />
                </div>
                <div>
                  <label className="field-label">County</label>
                  <input className="input-base" defaultValue={venue.state ?? ''} />
                </div>
                <div>
                  <label className="field-label">Country</label>
                  <input className="input-base" defaultValue={venue.country} />
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-surface-sunken border border-line aspect-[16/10] flex items-center justify-center text-ink-faint">
              <span className="inline-flex items-center gap-2 text-sm">
                <MapPin size={14} /> Map preview · {venue.coordinates?.latitude?.toFixed(4)},{' '}
                {venue.coordinates?.longitude?.toFixed(4)}
              </span>
            </div>
          </div>
        </Panel>


      </div>
    </>
  );
}

function FieldWithIcon({
  icon: Icon,
  label,
  defaultValue,
}: {
  icon: typeof Mail;
  label: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input className="input-base pl-9" defaultValue={defaultValue} />
      </div>
    </div>
  );
}
