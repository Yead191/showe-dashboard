import { useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Check,
    Layers,
    Zap,
    Award,
    ChevronRight,
    GraduationCap,
    Crown,
    Settings2,
    Target,
    PackagePlus,
    Sparkles,
} from 'lucide-react';
import { Button, Form, message, Tooltip, } from 'antd';
import { PageHeader, Panel, DeleteConfirmModal } from '@/components/ui';
import { cn } from '@/lib/utils';
import { TIER_META, TIER_LIST, type TierMeta } from '@/constants/tiers';
import { INITIAL_ADDONS, type AddOn } from '@/constants/addons';
import TierModal from './TierModal';
import AddOnModal from './AddOnModal';
import AdminAddOnCard from './AdminAddOnCard';

type TabKey = 'tiers' | 'addons';

interface TierInfo extends TierMeta {
    id: string;
}

const MODULES_LIST = [
    { label: 'Module 1: Foundation', value: 1 },
    { label: 'Module 2: Events', value: 2 },
    { label: 'Module 3: QR Distribution', value: 3 },
    { label: 'Module 4: Brand Customisation', value: 4 },
    { label: 'Module 5: Analytics', value: 5 },
    { label: 'Module 6: Cross-promotion', value: 6 },
    { label: 'Module 7: Sponsorship', value: 7 },
    { label: 'Module 8: Multi-language', value: 8 },
    { label: 'Module 9: Push Notifications', value: 9 },
    { label: 'Module 10: Location Utilities', value: 10 },
];

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
            priceMonthly: 0,
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
            priceMonthly: 25,
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
                MODULES_LIST={MODULES_LIST}
            />

            <AddOnModal
                isOpen={isAddOnModalOpen}
                onClose={() => setIsAddOnModalOpen(false)}
                editing={editingAddOn}
                form={addonForm}
                onOk={handleAddOnModalOk}
                modulesList={MODULES_LIST}
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

function TierTabs({
    activeTab,
    onChange,
    tierCount,
    addonCount,
}: {
    activeTab: TabKey;
    onChange: (key: TabKey) => void;
    tierCount: number;
    addonCount: number;
}) {
    const tabs: { key: TabKey; label: string; icon: typeof Layers; count: number; description: string }[] = [
        {
            key: 'tiers',
            label: 'Subscription Tiers',
            icon: Layers,
            count: tierCount,
            description: 'Core plans bundling module access',
        },
        {
            key: 'addons',
            label: 'Optional Add-Ons',
            icon: Sparkles,
            count: addonCount,
            description: 'À la carte upgrades',
        },
    ];

    return (
        <div className="mt-8 mb-8">
            <div
                role="tablist"
                aria-label="Platform plan management"
                className="inline-flex items-center gap-1 p-1.5 bg-surface-sunken border border-line rounded-2xl shadow-soft"
            >
                {tabs?.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.key === activeTab;
                    return (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={isActive}
                            type="button"
                            onClick={() => onChange(tab.key)}
                            className={cn(
                                'relative flex items-center gap-3 px-5 h-12 rounded-xl text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                                isActive
                                    ? 'bg-surface-raised text-ink shadow-medium border border-line'
                                    : 'text-ink-faint hover:text-ink-muted hover:bg-surface-raised/50 border border-transparent'
                            )}
                        >
                            <Icon
                                size={16}
                                strokeWidth={2.4}
                                className={cn(
                                    'transition-colors',
                                    isActive ? 'text-primary' : 'text-ink-faint'
                                )}
                            />
                            <span className="leading-none">{tab.label}</span>
                            <span
                                className={cn(
                                    'inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[10.5px] font-black tabular transition-all',
                                    isActive
                                        ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                        : 'bg-surface-offset text-ink-faint'
                                )}
                            >
                                {tab.count}
                            </span>
                            {isActive && (
                                <span className="absolute -bottom-px left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function TierCard({ tier, onEdit, onDelete }: { tier: TierInfo; onEdit: () => void; onDelete: () => void }) {
    const isProducer = tier.id === 'tier_3_plus';
    const isSchool = tier.id === 'tier_1';

    let Icon = Layers;
    if (tier.id === 'tier_2') Icon = Zap;
    if (tier.id === 'tier_3') Icon = Award;
    if (isProducer) Icon = Crown;
    if (isSchool) Icon = GraduationCap;

    return (
        <Panel className={cn(
            "relative flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:translate-y-[-8px] group",
            tier.recommended ? "border-primary/40 shadow-xl shadow-primary/5 ring-1 ring-primary/20" : "hover:border-line-strong shadow-soft"
        )}>
            {/* Background Accent Gradient */}
            <div
                className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-[0.08]  transition-all duration-700 group-hover:opacity-[0.15] group-hover:scale-150"
                style={{ backgroundColor: tier.color }}
            />

            {tier?.recommended && (
                <div className="absolute -top-3 left-6 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 z-10">
                    Recommended Plan
                </div>
            )}

            <div className="flex justify-between items-start mb-8">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm relative overflow-hidden"
                    style={{
                        backgroundColor: `${tier.color}15`,
                        borderColor: `${tier.color}30`,
                        color: tier.color
                    }}
                >
                    <Icon size={28} strokeWidth={2.5} className="relative z-10" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 2xl:transition-transform duration-500" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <Tooltip title="Edit Config">
                        <Button
                            className="w-9 h-9 rounded-xl flex items-center justify-center border-line bg-surface-raised hover:bg-primary/5 hover:border-primary/30 shadow-sm"
                            icon={<Edit2 size={15} className="text-ink-muted group-hover:text-primary transition-colors" />}
                            onClick={onEdit}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Tier">
                        <Button
                            className="w-9 h-9 rounded-xl flex items-center justify-center border-line bg-surface-raised hover:bg-error/5 hover:border-error/30 shadow-sm"
                            icon={<Trash2 size={15} className="text-ink-muted hover:text-error transition-colors" />}
                            onClick={onDelete}
                        />
                    </Tooltip>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-surface-sunken border border-line text-ink-faint">
                        {tier.short}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                        <Target size={12} />
                        {tier.audience?.split(',')[0]}
                    </span>
                </div>
                <h3 className="font-display font-extrabold text-3xl text-ink leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">{tier.label}</h3>
                <p className="text-[14px] text-ink-muted mt-2 leading-relaxed opacity-80 min-h-[42px] line-clamp-2">{tier.description}</p>
            </div>

            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-display font-black text-ink tabular">£{tier.priceMonthly}</span>
                    <span className="text-ink-faint text-[15px] font-medium">/ {tier.billingPeriod === 'yearly' ? 'year' : 'mo'}</span>
                </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-ink-faint uppercase tracking-widest flex items-center gap-2">
                        <Settings2 size={12} />
                        Module Coverage
                    </div>
                    <div className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/5 border border-primary/10">
                        {tier.modules.length}/10
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tier?.modules.map(mId => {
                        const m = MODULES_LIST.find(mod => mod.value === mId);
                        return (
                            <Tooltip key={mId} title={m?.label}>
                                <div className="bg-surface-sunken border border-line/60 text-ink-muted font-bold text-[9px] px-2 py-0.5 rounded-md transition-all hover:bg-primary hover:text-white hover:border-primary cursor-default">
                                    {mId}
                                </div>
                            </Tooltip>
                        );
                    })}
                </div>

                {/* Org Limits & Permissions */}
                <div className="pt-4 mt-2 border-t border-line/40">
                    <div className="text-[10px] font-bold text-ink-faint uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Target size={12} />
                        Org Limits &amp; Permissions
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <LimitPill
                            label="Venues"
                            value={tier.maxVenues === 0 ? 'Unlimited' : `Max ${tier.maxVenues}`}
                            color={tier.color}
                        />
                        <LimitPill
                            label="Programmes"
                            value={tier.maxProgrammes === 0 ? 'Unlimited' : `Max ${tier.maxProgrammes}`}
                            color={tier.color}
                        />
                        <LimitPill
                            label="Sell"
                            value={tier.canSell ? 'Allowed' : 'Not allowed'}
                            color={tier.canSell ? '#437A22' : '#9A938B'}
                            highlight={tier.canSell}
                        />
                        {tier.canSell && tier.minProgrammePrice !== undefined && (
                            <LimitPill
                                label="Min Price"
                                value={`£${tier.minProgrammePrice}`}
                                color={tier.color}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-3.5 pt-8 border-t border-line/60 relative">
                {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3.5 text-sm group/feature">
                        <div
                            className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 group-hover/feature:scale-110 group-hover/feature:shadow-md"
                            style={{ backgroundColor: `${tier.color}15`, color: tier.color }}
                        >
                            <Check size={11} strokeWidth={4} />
                        </div>
                        <span className="text-ink-muted font-medium leading-snug group-hover/feature:text-ink transition-colors">{feature}</span>
                    </div>
                ))}
            </div>

            <div className="mt-10 pt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <Button
                    block
                    className="h-12 rounded-xl border-none font-bold text-sm bg-surface-sunken text-ink hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                    onClick={onEdit}
                >
                    Update Plan Configuration
                    <ChevronRight size={14} className="opacity-50" />
                </Button>
            </div>
        </Panel>
    );
}

function LimitPill({
    label,
    value,
    color,
    highlight = false,
}: {
    label: string;
    value: string;
    color: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-[10px] font-bold',
                highlight ? 'border-transparent' : 'border-line/60'
            )}
            style={
                highlight
                    ? { backgroundColor: `${color}18`, color, borderColor: `${color}30` }
                    : { backgroundColor: 'var(--color-surface-sunken)', color: 'var(--color-ink-faint)' }
            }
        >
            <span className="uppercase tracking-widest opacity-60">{label}</span>
            <span className="font-black">{value}</span>
        </div>
    );
}
