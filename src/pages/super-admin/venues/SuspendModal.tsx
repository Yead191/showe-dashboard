import type { VenueOwner } from '@/types/venue';
import { Form, Input, Modal, InputNumber } from 'antd';
import { toast } from 'sonner';

export default function SuspendModal({ isSuspendModalOpen, setIsSuspendModalOpen, suspendForm, selectedOwner }: { isSuspendModalOpen: boolean, setIsSuspendModalOpen: (open: boolean) => void, suspendForm: any, selectedOwner: VenueOwner | null }) {
    return (
        <Modal
            title="Suspend Organisation"
            open={isSuspendModalOpen}
            onCancel={() => setIsSuspendModalOpen(false)}
            onOk={() => {
                suspendForm.validateFields().then(() => {
                    toast.success(`${selectedOwner?.org_name} has been suspended.`);
                    setIsSuspendModalOpen(false);
                });
            }}
            okText="Confirm Suspension"
            okButtonProps={{ danger: true, className: 'rounded-xl h-10' }}
            cancelButtonProps={{ className: 'rounded-xl h-10' }}
            className="premium-modal"
            centered
        >
            <Form form={suspendForm} layout="vertical" className="mt-4">
                <Form.Item name="reason" label="Reason for suspension" rules={[{ required: true }]}>
                    <Input.TextArea rows={3} className="input-base" placeholder="e.g. Terms of Service violation" />
                </Form.Item>
                <Form.Item name="duration" label="Duration (days)" initialValue={7}>
                    <InputNumber min={1} className="w-full input-base" />
                </Form.Item>
            </Form>
        </Modal>
    )
}
