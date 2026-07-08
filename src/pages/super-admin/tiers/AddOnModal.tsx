import { Modal, Form, Input, InputNumber, Select, Switch, Radio } from 'antd';
import type { FormInstance } from 'antd';
import { TIER_LIST, TIER_META, MODULES_LIST } from '@/constants/tiers';
import type { AddOn } from '@/constants/addons';
import { ADDON_ICONS } from '@/constants/addon-icons';

interface AddOnModalProps {
    isOpen: boolean;
    onClose: () => void;
    editing: AddOn | null;
    form: FormInstance;
    onOk: () => void;
    loading?: boolean;
}

const STATUS_OPTIONS = [
    { label: 'Live', value: 'live' },
    { label: 'Coming Soon', value: 'coming_soon' },
    { label: 'Archived', value: 'archived' },
];

const ICON_OPTIONS = Object.keys(ADDON_ICONS).map((name) => ({ label: name, value: name }));

const TIER_OPTIONS = TIER_LIST.map((t) => ({ label: TIER_META[t].label, value: t }));

export default function AddOnModal({
    isOpen,
    onClose,
    editing,
    form,
    onOk,
    loading = false,
}: AddOnModalProps) {
    const availableOn = Form.useWatch('availableOn', form);
    const availabilityMode: 'all' | 'specific' =
        availableOn === 'all' || availableOn == null ? 'all' : 'specific';

    return (
        <Modal
            title={editing ? 'Edit Add-On' : 'Create New Add-On'}
            open={isOpen}
            onOk={onOk}
            onCancel={onClose}
            width={760}
            className="premium-modal"
            okText={editing ? 'Save Changes' : 'Create Add-On'}
            okButtonProps={{ className: 'bg-primary h-11 px-8 rounded-xl', loading }}
            cancelButtonProps={{ className: 'h-11 px-6 rounded-xl', disabled: loading }}
            closable={!loading}
            maskClosable={!loading}
            centered
        >
            <Form form={form} layout="vertical" className="mt-6">
                <div className="grid grid-cols-2 gap-6">
                    <Form.Item name="label" label="Add-On Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Push Notifications" className="input-base" />
                    </Form.Item>
                    <Form.Item name="price" label="Monthly Price (£)" rules={[{ required: true }]}>
                        <InputNumber className="w-full input-base flex items-center" min={0} placeholder="25" />
                    </Form.Item>
                </div>

                <Form.Item name="description" label="Description / Value Prop" rules={[{ required: true }]}>
                    <Input.TextArea
                        placeholder="Send push notifications to your followers to keep them in the loop."
                        className="input-base"
                        rows={2}
                    />
                </Form.Item>

                <div className="grid grid-cols-3 gap-6">
                    <Form.Item name="color" label="Theme Colour">
                        <Input type="color" className="w-full h-11 p-1 rounded-lg border border-line bg-surface-raised cursor-pointer" />
                    </Form.Item>
                    <Form.Item name="short" label="Short Code" rules={[{ required: true }]}>
                        <Input placeholder="PUSH" className="input-base" />
                    </Form.Item>
                    <Form.Item name="icon" label="Icon" rules={[{ required: true }]}>
                        <Select options={ICON_OPTIONS} className="w-full" placeholder="Select icon" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <Form.Item
                        name="capabilityKey"
                        label="Capability Key"
                        rules={[
                            { required: true },
                            { pattern: /^[a-z0-9_]+$/, message: 'Lowercase letters, digits, underscores only' },
                        ]}
                        tooltip="Stable feature ID used by feature-gating code. Don't change after launch."
                    >
                        <Input placeholder="push_notifications" className="input-base font-mono text-xs" />
                    </Form.Item>
                    <Form.Item
                        name="linkedModule"
                        label="Linked Module (optional)"
                        tooltip="If set, purchasing unlocks this tier module for the venue."
                    >
                        <Select
                            options={MODULES_LIST}
                            allowClear
                            placeholder="Standalone — no module link"
                            className="w-full"
                        />
                    </Form.Item>
                </div>

                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                    <Radio.Group options={STATUS_OPTIONS} optionType="button" buttonStyle="solid" />
                </Form.Item>

                <Form.Item label="Availability" tooltip="Which tiers can purchase this add-on.">
                    <div className="flex items-center gap-3 mb-3 px-3.5 py-2.5 bg-surface-sunken rounded-lg border border-line/60">
                        <Switch
                            size="small"
                            checked={availabilityMode === 'all'}
                            onChange={(checked) => {
                                form.setFieldValue('availableOn', checked ? 'all' : []);
                            }}
                        />
                        <span className="text-sm font-medium text-ink">Available on all tiers</span>
                    </div>
                    {availabilityMode === 'specific' && (
                        <Form.Item
                            name="availableOn"
                            noStyle
                            rules={[
                                {
                                    validator: (_, v) =>
                                        Array.isArray(v) && v.length > 0
                                            ? Promise.resolve()
                                            : Promise.reject(new Error('Pick at least one tier')),
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select tiers"
                                options={TIER_OPTIONS}
                                className="w-full"
                                maxTagCount="responsive"
                            />
                        </Form.Item>
                    )}
                </Form.Item>

                <Form.Item name="bullets" label="Selling Points (one per line)" rules={[{ required: true }]}>
                    <Input.TextArea
                        rows={4}
                        placeholder="Send up to 20 notifications direct to phones&#10;Highlight events and announcements..."
                        className="input-base text-sm leading-relaxed"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
