import { Modal, Form, Input, InputNumber, Select, Switch, Button } from 'antd';
import { Minus, Plus } from 'lucide-react';
import { MODULES_LIST } from '@/constants/tiers';
import { ColorPickerField } from './ColorPickerField';

export default function TierModal({
    isModalOpen,
    setIsModalOpen,
    editingTier,
    form,
    handleModalOk,
    loading = false,
}: {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    editingTier: any;
    form: any;
    handleModalOk: () => void;
    loading?: boolean;
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
            okButtonProps={{ className: 'bg-primary h-11 px-8 rounded-xl', loading }}
            cancelButtonProps={{ className: 'h-11 px-6 rounded-xl', disabled: loading }}
            closable={!loading}
            maskClosable={!loading}
            centered
        >
            <Form form={form} layout="vertical" className="mt-6">
                <div className="grid grid-cols-3 gap-6">
                    <Form.Item name="label" label="Tier Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Amplify" className="input-base" />
                    </Form.Item>
                    <Form.Item name="price" label="Price (£)" rules={[{ required: true }]}>
                        <InputNumber className="w-full input-base flex items-center" min={0} placeholder="enter price here" />
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
                    <Form.Item name="color" label="Theme Colour" initialValue="#014B52">
                        <ColorPickerField />
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

                <Form.Item
                    name="modules"
                    label="Module Access (1–10)"
                    rules={[{ required: true, message: 'Select at least one module' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select modules"
                        className="w-full premium-select "
                        options={MODULES_LIST}
                        optionFilterProp="label"
                        maxTagCount="responsive"
                    />
                </Form.Item>

                <Form.List
                    name="features"
                    rules={[
                        {
                            validator: async (_, features) => {
                                const validItems = (features as string[] | undefined)?.filter(
                                    (feature) => feature?.trim()
                                );
                                if (!validItems?.length) {
                                    return Promise.reject(new Error('Add at least one feature'));
                                }
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }) => (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-ink">Features List</span>
                                <Button
                                    type="dashed"
                                    icon={<Plus size={14} />}
                                    onClick={() => add('')}
                                    className="rounded-lg"
                                >
                                    Add feature
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {fields.map((field) => (
                                    <div key={field.key} className="flex items-start gap-2">
                                        <Form.Item
                                            {...field}
                                            className="flex-1 mb-0"
                                            rules={[{ required: true, message: 'Feature is required' }]}
                                        >
                                            <Input
                                                placeholder="write feature here"
                                                className="input-base"
                                            />
                                        </Form.Item>
                                        <Button
                                            type="text"
                                            danger
                                            disabled={fields.length === 1}
                                            icon={<Minus size={14} />}
                                            onClick={() => remove(field.name)}
                                            className="mt-1 shrink-0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Form.List>

                {/* ── Org Limits & Permissions ── */}
                <div className="pt-5 mt-1 ">
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
