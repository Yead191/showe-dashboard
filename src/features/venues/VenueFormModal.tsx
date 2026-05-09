import { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { toast } from 'sonner';
import type { Venue } from '@/types/venue';
import { VenueFormFields } from './VenueFormFields';
import {
  DEFAULT_VENUE_FORM_STATE,
  venueFormStateToFormData,
  venueToFormState,
  type VenueFormState,
} from './types';

interface VenueFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  venue?: Venue | null;
  onClose: () => void;
  onSubmit?: (formData: FormData, state: VenueFormState) => void;
}

export function VenueFormModal({
  open,
  mode,
  venue,
  onClose,
  onSubmit,
}: VenueFormModalProps) {
  const [state, setState] = useState<VenueFormState>(DEFAULT_VENUE_FORM_STATE);

  useEffect(() => {
    if (!open) return;
    setState(venue ? venueToFormState(venue) : DEFAULT_VENUE_FORM_STATE);
  }, [open, venue]);

  function update<K extends keyof VenueFormState>(key: K, value: VenueFormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function handleSubmit() {
    if (!state.name.trim()) {
      toast.error('Venue name is required.');
      return;
    }
    if (!state.contact_email.trim()) {
      toast.error('Contact email is required.');
      return;
    }

    const formData = venueFormStateToFormData(state);

    // Demo: log FormData entries so it's clear they were built correctly
    // eslint-disable-next-line no-console
    console.log(`--- ${mode === 'create' ? 'Create' : 'Update'} venue FormData ---`);
    for (const [k, v] of formData.entries()) {
      // eslint-disable-next-line no-console
      console.log(k, v);
    }

    onSubmit?.(formData, state);
    toast.success(
      mode === 'create' ? 'Venue created (mock).' : 'Venue updated (mock).'
    );
    onClose();
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
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
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
