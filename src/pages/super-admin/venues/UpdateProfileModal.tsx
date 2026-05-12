import { Form, Input, Modal, Select } from 'antd';
import { toast } from 'sonner';

export default function UpdateProfileModal({ form, isUpdateModalOpen, setIsUpdateModalOpen, }: { form: any, isUpdateModalOpen: boolean, setIsUpdateModalOpen: (open: boolean) => void, }) {
    return (
        <Modal
            title="Update Organisation Profile"
            open={isUpdateModalOpen}
            onCancel={() => setIsUpdateModalOpen(false)}
            onOk={() => {
                form.validateFields().then(() => {
                    toast.success('Profile updated successfully.');
                    setIsUpdateModalOpen(false);
                });
            }}
            className="premium-modal"
            centered
            width={560}
        >
            <Form form={form} layout="vertical" className="mt-6">
                <Form.Item name="org_name" label="Organisation Name" rules={[{ required: true }]}>
                    <Input className="input-base" />
                </Form.Item>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="name" label="Primary Owner Name" rules={[{ required: true }]}>
                        <Input className="input-base" />
                    </Form.Item>
                    <Form.Item name="email" label="Contact Email" rules={[{ required: true, type: 'email' }]}>
                        <Input className="input-base" />
                    </Form.Item>
                </div>
                <Form.Item name="org_type" label="Entity Type" rules={[{ required: true }]}>
                    <Select className="input-base profile-select" options={[
                        { label: 'Venue', value: 'venue' },
                        { label: 'School / Club', value: 'school' },
                        { label: 'Producer / Company', value: 'producer' },
                    ]} />
                </Form.Item>
                <Form.Item name="phone" label="Phone Number">
                    <Input className="input-base" />
                </Form.Item>
            </Form>
        </Modal>
    )
}
