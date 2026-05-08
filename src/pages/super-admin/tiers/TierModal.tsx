import { Modal, Form, Input, InputNumber, Select, Switch } from 'antd';

export default function TierModal({
    isModalOpen,
    setIsModalOpen,
    editingTier,
    form,
    handleModalOk,
    MODULES_LIST
}: {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    editingTier: any;
    form: any;
    handleModalOk: () => void;
    MODULES_LIST: any[];
}) {
    return (
        <Modal
            title={editingTier ? 'Edit Subscription Tier' : 'Create New Subscription Tier'}
            open={isModalOpen}
            onOk={handleModalOk}
            onCancel={() => setIsModalOpen(false)}
            width={720}
            className="premium-modal"
            okText={editingTier ? 'Save Changes' : 'Create Tier'}
            okButtonProps={{ className: 'bg-primary h-11 px-8 rounded-xl' }}
            cancelButtonProps={{ className: 'h-11 px-6 rounded-xl' }}
            centered
        >
            <Form form={form} layout="vertical" className="mt-6">
                <div className="grid grid-cols-2 gap-6">
                    <Form.Item name="label" label="Tier Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Amplify" className="input-base" />
                    </Form.Item>
                    <Form.Item name="priceMonthly" label="Monthly Price (£)" rules={[{ required: true }]}>
                        <InputNumber className="w-full input-base flex items-center" min={0} placeholder="0" />
                    </Form.Item>
                </div>

                <Form.Item name="audience" label="Target Audience" rules={[{ required: true }]}>
                    <Input placeholder="e.g. Schools, colleges & amateur dramatic clubs" className="input-base" />
                </Form.Item>

                <Form.Item name="description" label="Description / Value Prop" rules={[{ required: true }]}>
                    <Input.TextArea placeholder="Foundation modules. Programmes free by default..." className="input-base" rows={2} />
                </Form.Item>

                <div className="grid grid-cols-3 gap-6">
                    <Form.Item name="color" label="Theme Colour">
                        <div className="flex gap-2 items-center">
                            <Input type="color" className="w-10 h-10 p-1 rounded-lg border border-line bg-surface-raised cursor-pointer" />
                            <Input name="color" placeholder="#014B52" className="input-base font-mono text-xs" />
                        </div>
                    </Form.Item>
                    <Form.Item name="short" label="Short Code" rules={[{ required: true }]}>
                        <Input placeholder="T1" className="input-base" />
                    </Form.Item>
                    <Form.Item name="recommended" label="Is Recommended" valuePropName="checked">
                        <div className="h-11 flex items-center px-3 bg-surface-sunken rounded-lg border border-line/50">
                            <Switch size="small" />
                            <span className="ml-2 text-xs text-ink-muted">Display tag</span>
                        </div>
                    </Form.Item>
                </div>

                <Form.Item name="modules" label="Module Access">
                    <Select
                        mode="multiple"
                        placeholder="Select modules"
                        className="w-full premium-select"
                        options={MODULES_LIST}
                        maxTagCount="responsive"
                    />
                </Form.Item>

                <Form.Item name="features" label="Features List (one per line)" rules={[{ required: true }]}>
                    <Input.TextArea
                        rows={5}
                        placeholder="Digital programme creation&#10;Basic event scheduling..."
                        className="input-base text-sm leading-relaxed"
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}
