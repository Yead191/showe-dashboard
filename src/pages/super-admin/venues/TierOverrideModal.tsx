import { Form, Modal, Select } from 'antd';
import { TIER_META, TIER_LIST } from '@/constants/tiers';
import { toast } from 'sonner';
import type { VenueOwner } from '@/types/venue';

export default function TierOverrideModal({ isTierModalOpen, setIsTierModalOpen, tierForm, selectedOwner }: { isTierModalOpen: boolean, setIsTierModalOpen: (open: boolean) => void, tierForm: any, selectedOwner: VenueOwner | null }) {
    return (
        <Modal
            title="Override Subscription Tier"
            open={isTierModalOpen}
            onCancel={() => setIsTierModalOpen(false)}
            onOk={() => {
                const newTier = tierForm.getFieldValue('tier');
                toast.success(`Tier updated to ${TIER_META[newTier as keyof typeof TIER_META].label}`);
                setIsTierModalOpen(false);
            }}
            className="premium-modal"
            centered
            width={480}
        >
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
                <p className="text-sm text-primary font-medium leading-relaxed">
                    Changing the tier will immediately adjust the available features and module access for <strong>{selectedOwner?.org_name}</strong>.
                </p>
            </div>
            <Form form={tierForm} layout="vertical">
                <Form.Item name="tier" label="Select New Tier" rules={[{ required: true }]}>
                    <Select
                        className="premium-select"
                        options={TIER_LIST.map(id => ({
                            label: TIER_META[id].label,
                            value: id
                        }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}
