import { useState, useMemo } from 'react';
import { Modal, Input, InputNumber, Select } from 'antd';
import type { Sponsor } from '../types';

interface SponsorModalProps {
  open: boolean;
  sponsor: Sponsor | null;
  onCancel: () => void;
  onSave: (values: Partial<Sponsor>) => void;
}

export function SponsorModal({
  open,
  sponsor,
  onCancel,
  onSave,
}: SponsorModalProps) {
  const [formValues, setFormValues] = useState<Partial<Sponsor>>({});

  // Reset form when modal opens
  useMemo(() => {
    if (open) setFormValues(sponsor || { name: '', slot: '', revenue: 0 });
  }, [open, sponsor]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={sponsor ? 'Edit sponsor slot' : 'New sponsor slot'}
      centered
      onOk={() => onSave(formValues)}
      okText={sponsor ? 'Update campaign' : 'Create slot'}
      className="premium-modal"
    >
      <div className="space-y-5 pt-2">
        <div>
          <label className="field-label">Sponsor name</label>
          <Input
            placeholder="e.g. The Gilded Fork"
            value={formValues.name}
            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            className="input-base"
          />
        </div>
        
        <div>
          <label className="field-label">Placement slot</label>
          <Select
            className="w-full h-11"
            value={formValues.slot}
            onChange={(v) => setFormValues({ ...formValues, slot: v })}
            placeholder="Select a slot"
            options={[
              { label: 'Cover sponsor (Premium)', value: 'Cover sponsor' },
              { label: 'Footer placement', value: 'Footer placement' },
              { label: 'Cast page banner', value: 'Cast page banner' },
              { label: 'Interval feature', value: 'Interval feature' },
              { label: 'Push notification blast', value: 'Push notification blast' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Campaign Value (£)</label>
            <InputNumber
              className="w-full input-base flex items-center"
              value={formValues.revenue}
              onChange={(v) => setFormValues({ ...formValues, revenue: v || 0 })}
              prefix="£"
              placeholder="0.00"
            />
            <p className="text-[11px] text-ink-faint mt-1.5">Fixed rate for this placement.</p>
          </div>
          
          <div>
            <label className="field-label">Status (Initial)</label>
            <Select
              className="w-full h-11"
              value={formValues.status || 'pending'}
              disabled={!!sponsor}
              onChange={(v) => setFormValues({ ...formValues, status: v })}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
              ]}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
