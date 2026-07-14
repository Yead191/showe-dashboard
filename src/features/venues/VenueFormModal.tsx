import { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { toast } from 'sonner';
import type { Venue } from '@/types/venue';
import {
  useCreateOrganizationVenueMutation,
  useUpdateOrganizationVenueMutation,
} from '@/store/api/organizationApi/venueApi';
import { VenueFormFields } from './VenueFormFields';
import {
  DEFAULT_VENUE_FORM_STATE,
  venueFormStateToPayload,
  venueToFormState,
  type VenueFormState,
} from './types';

interface VenueFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  venue?: Venue | null;
  onClose: () => void;
}

export function VenueFormModal({
  open,
  mode,
  venue,
  onClose,
}: VenueFormModalProps) {
  const [state, setState] = useState<VenueFormState>(DEFAULT_VENUE_FORM_STATE);
  const [createVenue, { isLoading: isCreating }] = useCreateOrganizationVenueMutation();
  const [updateVenue, { isLoading: isUpdating }] = useUpdateOrganizationVenueMutation();
  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    setState(venue ? venueToFormState(venue) : DEFAULT_VENUE_FORM_STATE);
  }, [open, venue]);

  function update<K extends keyof VenueFormState>(key: K, value: VenueFormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit() {
    if (!state.name.trim()) {
      toast.error('Venue name is required.');
      return;
    }
    if (!state.contact_email.trim()) {
      toast.error('Contact email is required.');
      return;
    }
    if (!state.address_line1.trim() || !state.city.trim() || !state.zip_code.trim() || !state.country.trim()) {
      toast.error('Address, city, postcode and country are required.');
      return;
    }

    const payload = venueFormStateToPayload(state);

    try {
      if (mode === 'create') {
        const result = await createVenue(payload).unwrap();
        toast.success(result.message || 'Venue created successfully.');
      } else if (venue?.id) {
        const result = await updateVenue({ id: venue.id, ...payload }).unwrap();
        toast.success(result.message || 'Venue updated successfully.');
      }
      onClose();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message || (mode === 'create' ? 'Failed to create venue.' : 'Failed to update venue.'));
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={mode === 'create' ? 'Add a new venue' : `Edit ${venue?.name ?? 'venue'}`}
      width={760}
      centered
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={isSubmitting}>
            {mode === 'create' ? 'Create venue' : 'Save changes'}
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        <VenueFormFields state={state} update={update} />
      </div>
    </Modal>
  );
}
