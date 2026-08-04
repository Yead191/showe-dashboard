import { useState, useMemo } from 'react';
import {
    Plus,
    PackagePlus,
} from 'lucide-react';
import { Button, Form, message, } from 'antd';
import { PageHeader, DeleteConfirmModal } from '@/components/ui';
import { type TierMeta } from '@/constants/tiers';
import { type AddOn, type AddOnAvailability, type CapabilityKey } from '@/constants/addons';
import TierModal from './TierModal';
import AddOnModal from './AddOnModal';
import AdminAddOnCard from './AdminAddOnCard';
import { TierTabs } from './TierTabs';
import { TierCard } from './TierCard';
import {
  useCreateSubscriptionPackageMutation,
  useDeleteSubscriptionPackageMutation,
  useGetSubscriptionPackagesQuery,
  useUpdateSubscriptionPackageMutation,
  type ApiSubscriptionPackage,
  type SubscriptionPackagePayload,
} from '@/store/api/subscriptionPackageApi';
import {
  useCreateAddOnsMutation,
  useDeleteAddOnsMutation,
  useGetAddOnsQuery,
  useUpdateAddOnsMutation,
  type AddOnPayload,
  type ApiAddOn,
} from '@/store/api/addOnsApi';

export type TabKey = 'tiers' | 'addons';

export interface TierInfo extends TierMeta {
    id: string;
}

function packageToTier(pkg: ApiSubscriptionPackage): TierInfo {
    return {
        id: pkg._id,
        label: pkg.label,
        short: pkg.short,
        audience: pkg.audience,
        modules: pkg.modules,
        can_charge: pkg.can_charge,
        description: pkg.description,
        color: pkg.color,
        price: pkg.priceMonthly,
        billingPeriod: 'monthly',
        features: pkg.features,
        recommended: pkg.recommended,
        maxVenues: pkg.vanues,
        maxProgrammes: pkg.programmes,
        canSell: pkg.is_proggramme_sell,
        minProgrammePrice: pkg.minimum_programme_price,
    };
}

function formToPackagePayload(values: Record<string, unknown>): SubscriptionPackagePayload {
    const features = Array.isArray(values.features)
        ? (values.features as string[]).map((feature) => feature.trim()).filter(Boolean)
        : typeof values.features === 'string'
            ? values.features.split('\n').filter((feature: string) => feature.trim() !== '')
            : [];

    const modules = Array.isArray(values.modules)
        ? values.modules.map(Number).filter((module) => module >= 1 && module <= 10)
        : [];

    const canSell = Boolean(values.canSell);

    return {
        label: values.label as string,
        short: values.short as string,
        audience: values.audience as string,
        modules,
        can_charge: canSell || Boolean(values.can_charge),
        description: values.description as string,
        color: values.color as string,
        priceMonthly: values.price as number,
        features,
        vanues: Number(values.maxVenues ?? 0),
        programmes: Number(values.maxProgrammes ?? 0),
        is_proggramme_sell: canSell,
        ...(canSell
            ? { minimum_programme_price: Number(values.minimum_programme_price ?? 0) }
            : {}),
    };
}

function addOnToLocal(addon: ApiAddOn): AddOn {
    return {
        id: addon._id,
        label: addon.label,
        short: addon.short,
        description: addon.description,
        bullets: addon.bullets,
        price: addon.priceMonthly,
        color: addon.color,
        icon: addon.icon,
        linkedModule: addon.linkedModule,
        capabilityKey: addon.capabilityKey as CapabilityKey,
        status: addon.status,
        availableOn: (addon.availableOn === 'all' ? 'all' : addon.availableOn) as AddOnAvailability,
    };
}

function formToAddOnPayload(values: Record<string, unknown>): AddOnPayload {
    const bullets =
        typeof values.bullets === 'string'
            ? values.bullets.split('\n').map((bullet: string) => bullet.trim()).filter(Boolean)
            : Array.isArray(values.bullets)
                ? (values.bullets as string[]).map((bullet) => bullet.trim()).filter(Boolean)
                : [];

    const availableOn =
        values.availableOn === 'all' || !values.availableOn
            ? 'all'
            : (values.availableOn as string[]);

    return {
        label: values.label as string,
        short: values.short as string,
        description: values.description as string,
        bullets,
        priceMonthly: values.price as number,
        color: values.color as string,
        icon: values.icon as string,
        linkedModule: values.linkedModule as number | undefined,
        capabilityKey: values.capabilityKey as string,
        status: values.status as string,
        availableOn,
    };
}

export default function AdminTiers() {
    const [activeTab, setActiveTab] = useState<TabKey>('tiers');

    const { data: packages = [], isLoading, isFetching } = useGetSubscriptionPackagesQuery();
    const [createPackage, { isLoading: isCreating }] = useCreateSubscriptionPackageMutation();
    const [updatePackage, { isLoading: isUpdating }] = useUpdateSubscriptionPackageMutation();
    const [deletePackage, { isLoading: isDeleting }] = useDeleteSubscriptionPackageMutation();

    const tiers = useMemo(() => packages.map(packageToTier), [packages]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<TierInfo | null>(null);
    const [form] = Form.useForm();

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tierToDelete, setTierToDelete] = useState<TierInfo | null>(null);

    // Add-On state
    const { data: apiAddOns = [], isLoading: isAddOnsLoading, isFetching: isAddOnsFetching } =
        useGetAddOnsQuery();
    const [createAddOn, { isLoading: isAddOnCreating }] = useCreateAddOnsMutation();
    const [updateAddOn, { isLoading: isAddOnUpdating }] = useUpdateAddOnsMutation();
    const [deleteAddOn, { isLoading: isAddOnDeleting }] = useDeleteAddOnsMutation();

    const addons = useMemo(() => apiAddOns.map(addOnToLocal), [apiAddOns]);
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
            features: [''],
            maxVenues: 1,
            maxProgrammes: 10,
            canSell: false,
            minimum_programme_price: 2,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (tier: TierInfo) => {
        setEditingTier(tier);
        form.setFieldsValue({
            ...tier,
            minimum_programme_price: tier.minProgrammePrice,
            features: tier.features.length > 0 ? tier.features : [''],
        });
        setIsModalOpen(true);
    };

    const handleDelete = (tier: TierInfo) => {
        setTierToDelete(tier);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!tierToDelete) return;
        try {
            const response = await deletePackage(tierToDelete.id).unwrap();
            message.success(response.message || `${tierToDelete.label} tier deleted successfully`);
            setIsDeleteModalOpen(false);
            setTierToDelete(null);
        } catch (err) {
            const errorMessage =
                typeof err === 'object' && err !== null && 'data' in err
                    ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to delete tier.')
                    : 'Failed to delete tier.';
            message.error(errorMessage);
        }
    };

    const handleModalOk = () => {
        form.validateFields().then(async (values) => {
            const payload = formToPackagePayload(values);

            try {
                if (editingTier) {
                    const response = await updatePackage({
                        id: editingTier.id,
                        data: payload,
                    }).unwrap();
                    message.success(response.message || 'Tier updated successfully');
                } else {
                    const response = await createPackage(payload).unwrap();
                    message.success(response.message || 'New tier created successfully');
                }
                setIsModalOpen(false);
                form.resetFields();
                setEditingTier(null);
            } catch (err) {
                const errorMessage =
                    typeof err === 'object' && err !== null && 'data' in err
                        ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to save tier.')
                        : 'Failed to save tier.';
                message.error(errorMessage);
            }
        });
    };

    // --- Add-On handlers ---
    const handleAddOnAdd = () => {
        setEditingAddOn(null);
        addonForm.resetFields();
        addonForm.setFieldsValue({
            price: 25,
            color: '#DA7101',
            status: 'live',
            icon: 'Megaphone',
            availableOn: 'all',
            bullets: [''],
        });
        setIsAddOnModalOpen(true);
    };

    const handleAddOnEdit = (addon: AddOn) => {
        setEditingAddOn(addon);
        addonForm.setFieldsValue({
            ...addon,
            bullets: addon.bullets.length > 0 ? addon.bullets : [''],
        });
        setIsAddOnModalOpen(true);
    };

    const handleAddOnDelete = (addon: AddOn) => {
        setAddOnToDelete(addon);
        setIsAddOnDeleteOpen(true);
    };

    const confirmAddOnDelete = async () => {
        if (!addOnToDelete) return;
        try {
            const response = await deleteAddOn(addOnToDelete.id).unwrap();
            message.success(response.message || `${addOnToDelete.label} add-on deleted`);
            setIsAddOnDeleteOpen(false);
            setAddOnToDelete(null);
        } catch (err) {
            const errorMessage =
                typeof err === 'object' && err !== null && 'data' in err
                    ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to delete add-on.')
                    : 'Failed to delete add-on.';
            message.error(errorMessage);
        }
    };

    const handleAddOnModalOk = () => {
        addonForm.validateFields().then(async (values) => {
            const payload = formToAddOnPayload(values);

            try {
                if (editingAddOn) {
                    const response = await updateAddOn({
                        id: editingAddOn.id,
                        data: payload,
                    }).unwrap();
                    message.success(response.message || 'Add-on updated successfully');
                } else {
                    const response = await createAddOn(payload).unwrap();
                    message.success(response.message || 'New add-on created successfully');
                }
                setIsAddOnModalOpen(false);
                addonForm.resetFields();
                setEditingAddOn(null);
            } catch (err) {
                const errorMessage =
                    typeof err === 'object' && err !== null && 'data' in err
                        ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to save add-on.')
                        : 'Failed to save add-on.';
                message.error(errorMessage);
            }
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
                    {(isLoading || isFetching) && tiers.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-ink-muted">Loading tiers...</div>
                    ) : (
                        tiers?.map((tier) => (
                            <TierCard
                                key={tier.id}
                                tier={tier}
                                onEdit={() => handleEdit(tier)}
                                onDelete={() => handleDelete(tier)}
                            />
                        ))
                    )}
                </div>
            ) : (
                <div
                    key="addons-grid"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger"
                >
                    {(isAddOnsLoading || isAddOnsFetching) && addons.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-ink-muted">Loading add-ons...</div>
                    ) : (
                        addons.map((addon) => (
                            <AdminAddOnCard
                                key={addon.id}
                                addon={addon}
                                onEdit={() => handleAddOnEdit(addon)}
                                onDelete={() => handleAddOnDelete(addon)}
                            />
                        ))
                    )}
                </div>
            )}

            <TierModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                editingTier={editingTier}
                form={form}
                handleModalOk={handleModalOk}
                loading={isCreating || isUpdating}
            />

            <AddOnModal
                isOpen={isAddOnModalOpen}
                onClose={() => setIsAddOnModalOpen(false)}
                editing={editingAddOn}
                form={addonForm}
                onOk={handleAddOnModalOk}
                loading={isAddOnCreating || isAddOnUpdating}
            />

            <DeleteConfirmModal
                open={isDeleteModalOpen}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                loading={isDeleting}
                title="Delete Subscription Tier?"
                description="This will permanently remove the tier and its associated configuration. This action cannot be undone."
                targetName={tierToDelete?.label}
                confirmText="Delete Tier"
            />

            <DeleteConfirmModal
                open={isAddOnDeleteOpen}
                onConfirm={confirmAddOnDelete}
                onCancel={() => setIsAddOnDeleteOpen(false)}
                loading={isAddOnDeleting}
                title="Delete Add-On?"
                description="This will permanently remove the add-on. Venues currently subscribed will lose access on their next billing cycle."
                targetName={addOnToDelete?.label}
                confirmText="Delete Add-On"
            />
        </div>
    );
}
