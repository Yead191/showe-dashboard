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
                <div className="grid grid-cols-3 gap-6">
                    <Form.Item name="label" label="Tier Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Amplify" className="input-base" />
                    </Form.Item>
                    <Form.Item name="price" label="Price (£)" rules={[{ required: true }]}>
                        <InputNumber className="w-full input-base flex items-center" min={0} placeholder="0" />
                    </Form.Item>
                    <Form.Item name="billingPeriod" label="Billing Period" rules={[{ required: true }]}>
                        <Select
                            className="w-full premium-select"
                            options={[
                                { label: 'Monthly', value: 'monthly' },
                                { label: 'Yearly', value: 'yearly' },
                            ]}
                        />
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

                    {/* ✅ FIX: Switch is the direct Form.Item child */}
                    <Form.Item
                        name="recommended"
                        label="Is Recommended"
                        valuePropName="checked"
                        extra={<span className="text-[11px] text-ink-faint">Shows "Recommended Plan" badge</span>}
                    >
                        <Switch />
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

                {/* ── Org Limits & Permissions ── */}
                <div className="pt-5 mt-1 border-t border-line/60">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-ink-faint mb-4">
                        Org Limits &amp; Permissions
                    </p>
                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.billingPeriod !== currentValues.billingPeriod}
                    >
                        {({ getFieldValue }) => {
                            const period = getFieldValue('billingPeriod') === 'yearly' ? 'year' : 'month';
                            return (
                                <div className="grid grid-cols-2 gap-6">
                                    <Form.Item
                                        name="maxVenues"
                                        label={`Max Venues per Org (per ${period})`}
                                        tooltip={`How many venues an organisation can create on this tier. Set 0 for unlimited. This limit applies per billing cycle (per ${period}).`}
                                        rules={[{ required: true, message: 'Required' }]}
                                    >
                                        <InputNumber
                                            className="w-full input-base flex items-center"
                                            min={0}
                                            placeholder="e.g. 5"
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        name="maxProgrammes"
                                        label={`Max Programmes per Org (per ${period})`}
                                        tooltip={`How many programmes an organiser can run on this tier. Set 0 for unlimited. This limit applies per billing cycle (per ${period}).`}
                                        rules={[{ required: true, message: 'Required' }]}
                                    >
                                        <InputNumber
                                            className="w-full input-base flex items-center"
                                            min={0}
                                            placeholder="e.g. 25"
                                        />
                                    </Form.Item>
                                </div>
                            );
                        }}
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.canSell !== currentValues.canSell}
                    >
                        {({ getFieldValue }) => (
                            <div className="grid grid-cols-2 gap-6 mt-6">
                                {/* ✅ FIX: Switch is the direct Form.Item child */}
                                <Form.Item
                                    name="canSell"
                                    label="Can Sell Programmes"
                                    valuePropName="checked"
                                    tooltip="Whether organisations on this tier are allowed to sell their programmes to audiences."
                                    extra={<span className="text-[11px] text-ink-faint">Allow orgs on this tier to charge audiences for programmes</span>}
                                >
                                    <Switch />
                                </Form.Item>

                                {getFieldValue('canSell') && (
                                    <Form.Item
                                        name="minProgrammePrice"
                                        label="Min Programme Price (£)"
                                        tooltip="The minimum price an organisation can charge for a programme."
                                        rules={[{ required: true, message: 'Required' }]}
                                    >
                                        <InputNumber
                                            className="w-full input-base flex items-center"
                                            min={0}
                                            placeholder="e.g. 2"
                                        />
                                    </Form.Item>
                                )}
                            </div>
                        )}
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    )
}
