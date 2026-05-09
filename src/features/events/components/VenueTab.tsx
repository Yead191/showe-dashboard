import { useAuthStore } from '@/store/auth.store';
import type { EventFormState } from '../types';
import type { Venue } from '@/types/venue';
import { Check, Info, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, Button } from 'antd';
import { useState } from 'react';

interface VenueTabProps {
  state: EventFormState;
  update: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

export function VenueTab({ state, update }: VenueTabProps) {
  const venues = useAuthStore((s) => s.user?.venues) ?? [];
  const [previewVenue, setPreviewVenue] = useState<Venue | null>(null);

  const handleSelect = (v: Venue) => {
    update('venue_id', v.id);
    update('venue_name', v.name);
    update('address_line1', v.address_line1);
    update('address_line2', v.address_line2 || '');
    update('city', v.city);
    update('state', v.state || '');
    update('zip_code', v.zip_code);
    update('country', v.country);
    update('latitude', String(v.coordinates?.latitude || ''));
    update('longitude', String(v.coordinates?.longitude || ''));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        {venues.map((v) => {
          const isSelected = state.venue_id === v.id;
          return (
            <div
              key={v.id}
              onClick={() => handleSelect(v)}
              className={cn(
                "relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-line bg-surface-base hover:border-primary/40 hover:bg-surface-sunken/50"
              )}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-line">
                <img src={v.cover_image} className="w-full h-full object-cover" alt={v.name} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-bold text-ink flex items-center gap-2 text-base">
                  {v.name}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="text-[13px] text-ink-muted flex items-center gap-1.5 mt-1">
                  <MapPin size={13} className="text-ink-faint" />
                  {v.city}, {v.country}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewVenue(v);
                }}
                className="w-10 h-10 rounded-xl hover:bg-surface-sunken text-ink-faint hover:text-primary transition-all flex items-center justify-center border border-transparent hover:border-line"
                title="View details"
              >
                <Info size={20} />
              </button>
            </div>
          );
        })}

        {venues.length === 0 && (
          <div className="py-12 text-center bg-surface-base rounded-2xl border border-dashed border-line">
            <div className="text-ink-faint text-sm">No venues found. Add a venue first in the Venues page.</div>
          </div>
        )}
      </div>

      {previewVenue && (
        <Modal
          open={!!previewVenue}
          onCancel={() => setPreviewVenue(null)}
          footer={null}
          title={null}
          centered
          width={440}
          className="premium-modal"
        >
          <div className="p-1 space-y-5">
             <div className="relative h-48 rounded-2xl overflow-hidden">
                <img src={previewVenue.cover_image} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                   <h3 className="font-display font-extrabold text-xl text-white drop-shadow-md">
                      {previewVenue.name}
                   </h3>
                </div>
             </div>
             
             <div>
                <div className="eyebrow mb-2">Description</div>
                <p className="text-[14px] leading-relaxed text-ink-muted">
                  {previewVenue.description || 'No description provided for this venue.'}
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="eyebrow mb-1">Location</div>
                  <div className="text-[13px] text-ink font-medium">{previewVenue.city}, {previewVenue.country}</div>
                </div>
                <div>
                  <div className="eyebrow mb-1">Capacity</div>
                  <div className="text-[13px] text-ink font-medium">Standard Seating</div>
                </div>
             </div>

             <div className="pt-4 border-t border-line">
                <Button 
                  type="primary" 
                  size="large"
                  block 
                  onClick={() => {
                    handleSelect(previewVenue);
                    setPreviewVenue(null);
                  }}
                  className="h-12 rounded-xl"
                >
                  Select this venue
                </Button>
             </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
