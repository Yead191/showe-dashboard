import { useState } from 'react';
import {
    Plus,
    PackagePlus,
} from 'lucide-react';
import { Button, Form, message, } from 'antd';
import { PageHeader, DeleteConfirmModal } from '@/components/ui';
import { TIER_META, TIER_LIST, type TierMeta, } from '@/constants/tiers';
import { INITIAL_ADDONS, type AddOn } from '@/constants/addons';
import TierModal from './TierModal';
import AddOnModal from './AddOnModal';
import AdminAddOnCard from './AdminAddOnCard';
import { TierTabs } from './TierTabs';
import { TierCard } from './TierCard';

export type TabKey = 'tiers' | 'addons';

export interface TierInfo extends TierMeta {
    id: string;
}

const INITIAL_TIERS: TierInfo[] = TIER_LIST?.map(id => ({
    id,
    ...TIER_META[id]
}));

export default function AdminTiers() {
    const [activeTab, setActiveTab] = useState<TabKey>('tiers');

    const [tiers, setTiers] = useState<TierInfo[]>(INITIAL_TIERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<TierInfo | null>(null);
    const [form] = Form.useForm();

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tierToDelete, setTierToDelete] = useState<TierInfo | null>(null);

    // Add-On state
    const [addons, setAddons] = useState<AddOn[]>(INITIAL_ADDONS);
    const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
    const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
    const [addonForm] = Form.useForm();
    const [isAddOnDeleteOpen, setIsAddOnDeleteOpen] = useState(false);
    const [addOnToDelete, setAddOnToDelete] = useState<AddOn | null>(null);

    const handleAdd = () => {
        setEditingTier(null);
        form.resetFields();
        form.setFieldsValue({
            price: 0,
            billingPeriod: 'monthly',
            modules: [1],
            recommended: false,
            color: '#014B52',
            features: [],
            maxVenues: 1,
            maxProgrammes: 10,
            canSell: false,
            minProgrammePrice: 2,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (tier: TierInfo) => {
        setEditingTier(tier);
        form.setFieldsValue({
            ...tier,
            features: tier.features.join('\n'),
        });
        setIsModalOpen(true);
    };

    const handleDelete = (tier: TierInfo) => {
        setTierToDelete(tier);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (tierToDelete) {
            setTiers(tiers.filter(t => t.id !== tierToDelete.id));
            message.success(`${tierToDelete.label} tier deleted successfully`);
            setIsDeleteModalOpen(false);
            setTierToDelete(null);
        }
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            const processedValues = {
                ...values,
                features: typeof values.features === 'string'
                    ? values.features.split('\n').filter((f: string) => f.trim() !== '')
                    : values.features,
            };

            if (editingTier) {
                setTiers(tiers.map(t => t.id === editingTier.id ? { ...t, ...processedValues } : t));
                message.success('Tier updated successfully');
            } else {
                const newTier = {
                    ...processedValues,
                    id: `tier_${Date.now()}`,
                };
                setTiers([...tiers, newTier]);
                message.success('New tier created successfully');
            }
            setIsModalOpen(false);
        });
    };

    // --- Add-On handlers ---
    const handleAddOnAdd = () => {
        setEditingAddOn(null);
        addonForm.resetFields();
        addonForm.setFieldsValue({
            price: 25,
            color: '#01696F',
            status: 'live',
            icon: 'Sparkles',
            availableOn: 'all',
            bullets: '',
        });
        setIsAddOnModalOpen(true);
    };

    const handleAddOnEdit = (addon: AddOn) => {
        setEditingAddOn(addon);
        addonForm.setFieldsValue({
            ...addon,
            bullets: addon.bullets.join('\n'),
        });
        setIsAddOnModalOpen(true);
    };

    const handleAddOnDelete = (addon: AddOn) => {
        setAddOnToDelete(addon);
        setIsAddOnDeleteOpen(true);
    };

    const confirmAddOnDelete = () => {
        if (addOnToDelete) {
            setAddons(addons.filter(a => a.id !== addOnToDelete.id));
            message.success(`${addOnToDelete.label} add-on deleted`);
            setIsAddOnDeleteOpen(false);
            setAddOnToDelete(null);
        }
    };

    const handleAddOnModalOk = () => {
        addonForm.validateFields().then(values => {
            const processed: Omit<AddOn, 'id'> = {
                ...values,
                bullets: typeof values.bullets === 'string'
                    ? values.bullets.split('\n').map((b: string) => b.trim()).filter(Boolean)
                    : values.bullets,
                availableOn: values.availableOn === 'all' || !values.availableOn ? 'all' : values.availableOn,
            };

            if (editingAddOn) {
                setAddons(addons.map(a => a.id === editingAddOn.id ? { ...a, ...processed } : a));
                message.success('Add-on updated successfully');
            } else {
                const newAddOn: AddOn = {
                    ...processed,
                    id: `addon_${Date.now()}`,
                };
                setAddons([...addons, newAddOn]);
                message.success('New add-on created successfully');
            }
            setIsAddOnModalOpen(false);
        });
    };

    const isTiers = activeTab === 'tiers';
    const headerCopy = isTiers
        ? {
            title: 'Subscription Tiers',
            description: 'Manage the pricing, module access, and value propositions for the SHOWE ecosystem.',
        }
        : {
            title: 'Optional Add-Ons',
            description: 'À la carte upgrades that venues can purchase on top of any tier.',
        };

    return (
        <div className="">
            <PageHeader
                eyebrow="Platform Management"
                title={headerCopy.title}
                description={headerCopy.description}
                actions={
                    isTiers ? (
                        <Button
                            type="primary"
                            size="large"
                            icon={<Plus size={16} />}
                            onClick={handleAdd}
                            className="h-11 px-6 rounded-xl bg-primary hover:bg-primary-600 border-none shadow-lg shadow-primary/20"
                        >
                            Create new tier
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            size="large"
                            icon={<PackagePlus size={16} />}
                            onClick={handleAddOnAdd}
                            className="h-11 px-6 rounded-xl bg-primary hover:bg-primary-600 border-none shadow-lg shadow-primary/20"
                        >
                            Create add-on
                        </Button>
                    )
                }
            />

            <TierTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tierCount={tiers?.length}
                addonCount={addons?.length}
            />

            {isTiers ? (
                <div
                    key="tiers-grid"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 stagger"
                >
                    {tiers?.map((tier) => (
                        <TierCard
                            key={tier.id}
                            tier={tier}
                            onEdit={() => handleEdit(tier)}
                            onDelete={() => handleDelete(tier)}
                        />
                    ))}
                </div>
            ) : (
                <div
                    key="addons-grid"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger"
                >
                    {addons.map((addon) => (
                        <AdminAddOnCard
                            key={addon.id}
                            addon={addon}
                            onEdit={() => handleAddOnEdit(addon)}
                            onDelete={() => handleAddOnDelete(addon)}
                        />
                    ))}
                </div>
            )}

            <TierModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                editingTier={editingTier}
                form={form}
                handleModalOk={handleModalOk}
            />

            <AddOnModal
                isOpen={isAddOnModalOpen}
                onClose={() => setIsAddOnModalOpen(false)}
                editing={editingAddOn}
                form={addonForm}
                onOk={handleAddOnModalOk}
            />

            <DeleteConfirmModal
                open={isDeleteModalOpen}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                title="Delete Subscription Tier?"
                description="This will permanently remove the tier and its associated configuration. This action cannot be undone."
                targetName={tierToDelete?.label}
                confirmText="Delete Tier"
            />

            <DeleteConfirmModal
                open={isAddOnDeleteOpen}
                onConfirm={confirmAddOnDelete}
                onCancel={() => setIsAddOnDeleteOpen(false)}
                title="Delete Add-On?"
                description="This will permanently remove the add-on. Venues currently subscribed will lose access on their next billing cycle."
                targetName={addOnToDelete?.label}
                confirmText="Delete Add-On"
            />
        </div>
    );
}
