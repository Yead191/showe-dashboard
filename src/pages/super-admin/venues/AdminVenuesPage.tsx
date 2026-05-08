import { useMemo, useState } from 'react';
import { Table, Button, Dropdown, Tabs, Drawer, Modal, Form, Input, Select, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  Crown,
  CheckCircle2,
  Settings,
  Trash2,
  Building2,
  Mail,
  Phone,
  Calendar,
  Zap,
  BarChart3,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, TierBadge, StatusBadge, Avatar, SectionTitle, DeleteConfirmModal } from '@/components/ui';
import { mockVenueOwners } from '@/constants/venue-owners';
import { mockProgrammes } from '@/constants/mock-data';
import { TIER_META, TIER_LIST } from '@/constants/tiers';
import type { VenueOwner } from '@/types/venue';
import { formatGBP, formatDate, } from '@/lib/utils';

export default function AdminVenuesPage() {
  const [search, setSearch] = useState('');
  const [statusKey, setStatusKey] = useState('all');

  // Interaction states
  const [selectedOwner, setSelectedOwner] = useState<VenueOwner | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [form] = Form.useForm();
  const [tierForm] = Form.useForm();
  const [suspendForm] = Form.useForm();

  const filtered = useMemo(() => {
    return mockVenueOwners.filter((o) => {
      if (statusKey !== 'all' && o.status !== statusKey) return false;
      const term = search.toLowerCase();
      if (search &&
        !o.name.toLowerCase().includes(term) &&
        !o.email.toLowerCase().includes(term) &&
        !o.org_name.toLowerCase().includes(term)
      ) return false;
      return true;
    });
  }, [search, statusKey]);

  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: mockVenueOwners.length };
    for (const o of mockVenueOwners) acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, []);

  const handleEdit = (owner: VenueOwner) => {
    setSelectedOwner(owner);
    form.setFieldsValue(owner);
    setIsUpdateModalOpen(true);
  };

  const handleTierOverride = (owner: VenueOwner) => {
    setSelectedOwner(owner);
    tierForm.setFieldsValue({ tier: owner.tier });
    setIsTierModalOpen(true);
  };

  const handleSuspend = (owner: VenueOwner) => {
    setSelectedOwner(owner);
    suspendForm.setFieldsValue({ reason: '', duration: 7 });
    setIsSuspendModalOpen(true);
  };

  const handleDelete = (owner: VenueOwner) => {
    setSelectedOwner(owner);
    setIsDeleteModalOpen(true);
  };

  const columns: ColumnsType<VenueOwner> = [
    {
      title: 'Organisation & Owner',
      dataIndex: 'org_name',
      render: (_, r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={r.avatar_url} name={r.name} size={40} ring />
          <div className="min-w-0">
            <div className="font-bold text-ink truncate leading-tight">{r.org_name}</div>
            <div className="text-[12px] text-ink-faint truncate mt-0.5">{r.name} · {r.email}</div>
          </div>
        </div>
      ),
      width: 320,
    },
    {
      title: 'Type',
      dataIndex: 'org_type',
      render: (t: string) => <span className="chip capitalize">{t}</span>,
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      render: (t) => <TierBadge tier={t} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Venues',
      dataIndex: 'venues_count',
      align: 'center',
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{v}</span>,
    },
    {
      title: 'Total Revenue',
      dataIndex: 'total_revenue',
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{formatGBP(v, { compact: true })}</span>,
    },
    {
      title: 'Joined',
      dataIndex: 'joined_at',
      render: (d: string) => <span className="text-[12.5px] text-ink-muted">{formatDate(d)}</span>,
    },
    {
      title: '',
      align: 'right',
      render: (_, r) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <Eye size={13} />, label: 'View full details' },
              { key: 'edit', icon: <Settings size={13} />, label: 'Update profile' },
              { key: 'tier', icon: <Crown size={13} />, label: 'Override tier' },
              { type: 'divider' },
              r.status === 'pending'
                ? { key: 'approve', icon: <CheckCircle2 size={13} />, label: 'Approve' }
                : null,
              r.status !== 'suspended'
                ? { key: 'suspend', icon: <Ban size={13} />, label: 'Suspend owner', danger: true }
                : { key: 'unsuspend', icon: <CheckCircle2 size={13} />, label: 'Unsuspend owner' },
              { key: 'delete', icon: <Trash2 size={13} />, label: 'Delete permanently', danger: true },
            ].filter(Boolean) as never,
            onClick: ({ key }) => {
              if (key === 'view') setSelectedOwner(r);
              else if (key === 'edit') handleEdit(r);
              else if (key === 'tier') handleTierOverride(r);
              else if (key === 'suspend') handleSuspend(r);
              else if (key === 'delete') handleDelete(r);
              else if (key === 'approve') toast.success(`${r.org_name} approved successfully.`);
              else if (key === 'unsuspend') toast.success(`${r.org_name} has been unsuspended.`);
            },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreHorizontal size={15} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Network"
        title="Venues & owners"
        description="Comprehensive management of all theatre venues, schools, and production companies on the platform."
      />

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-3 border-b border-line">
          <Tabs
            activeKey={statusKey}
            onChange={setStatusKey}
            items={[
              { key: 'all', label: tab('All entities', counts.all) },
              { key: 'active', label: tab('Active', counts.active) },
              { key: 'pending', label: tab('Pending', counts.pending) },
              { key: 'suspended', label: tab('Suspended', counts.suspended) },
            ]}
          />
          <div className="ml-auto relative max-w-xs w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by organisation, owner or email"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1200 }}
          className="premium-table"
        />
      </Panel>

      {/* Owner Detail Drawer */}
      <Drawer
        open={!!selectedOwner && !isUpdateModalOpen && !isTierModalOpen && !isSuspendModalOpen && !isDeleteModalOpen}
        onClose={() => setSelectedOwner(null)}
        width={640}
        title={<span className="font-display font-bold">Organisation Details</span>}
        className="premium-drawer"
      >
        {selectedOwner && (
          <OwnerDrawerContent
            owner={selectedOwner}
            onEdit={() => handleEdit(selectedOwner)}
            onTier={() => handleTierOverride(selectedOwner)}
            onSuspend={() => handleSuspend(selectedOwner)}
          />
        )}
      </Drawer>

      {/* Update Profile Modal */}
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
            <Select className="input-base" options={[
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

      {/* Tier Override Modal */}
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

      {/* Suspend Modal */}
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

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          toast.success('Organisation permanently deleted.');
          setIsDeleteModalOpen(false);
        }}
        title="Delete Organisation?"
        description="This will permanently remove the organisation, all their venues, and all historical data. This cannot be undone."
        targetName={selectedOwner?.org_name}
      />
    </>
  );
}

function OwnerDrawerContent({ owner, onEdit, onTier, onSuspend }: { owner: VenueOwner, onEdit: () => void, onTier: () => void, onSuspend: () => void }) {
  const ownerProgrammes = mockProgrammes.filter(p => p.venue_id === 'ven_001'); // Mock filter for demonstration

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <Avatar src={owner.avatar_url} name={owner.name} size={80} ring />
          <div>
            <h2 className="font-display font-black text-3xl text-ink leading-tight">{owner.org_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <TierBadge tier={owner.tier} />
              <StatusBadge status={owner.status} />
            </div>
          </div>
        </div>
        <Button icon={<Settings size={16} />} onClick={onEdit} className="rounded-xl">Edit</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem icon={BookOpen} label="Programmes" value={ownerProgrammes.length.toString()} />
        <StatItem icon={Zap} label="Interactions" value="12.4k" />
        <StatItem icon={TrendingUp} label="Items Sold" value="842" />
        <StatItem icon={BarChart3} label="Revenue" value={formatGBP(owner.total_revenue, { compact: true })} />
      </div>

      <div className="space-y-6">
        <div>
          <SectionTitle title="Owner Information" />
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 mt-4 p-5 rounded-2xl bg-surface-sunken/50 border border-line">
            <InfoField icon={Building2} label="Organisation" value={owner.org_name} />
            <InfoField icon={Mail} label="Email Address" value={owner.email} />
            <InfoField icon={Phone} label="Phone Number" value={owner.phone || 'Not provided'} />
            <InfoField icon={Calendar} label="Joined Date" value={formatDate(owner.joined_at)} />
          </div>
        </div>

        <div>
          <SectionTitle
            title="Published Programmes"
            action={<span className="text-[10px] font-black uppercase tracking-widest text-ink-faint">Live now</span>}
          />
          <div className="space-y-3 mt-4">
            {ownerProgrammes.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-raised border border-line hover:border-line-strong transition-all shadow-sm">
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-line">
                  <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink truncate">{p.title}</div>
                  <div className="text-[12px] text-ink-muted mt-1 flex items-center gap-2">
                    <span className="font-medium">{p.pages_count} pages</span>
                    <span className="w-1 h-1 rounded-full bg-line" />
                    <span>{formatDate(p.published_at!)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-ink">{p.downloads}</div>
                  <div className="text-[10px] uppercase font-black text-ink-faint tracking-widest">Views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-line flex gap-3">
        <Button block size="large" icon={<Crown size={16} />} onClick={onTier} className="rounded-xl font-bold h-12">
          Override Tier
        </Button>
        <Button onClick={() => { onSuspend(); }} block danger size="large" icon={<Ban size={16} />} className="rounded-xl font-bold h-12">
          Suspend Entity
        </Button>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-surface-sunken/40 border border-line">
      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
        <Icon size={16} />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">{label}</div>
      <div className="font-display font-black text-2xl text-ink tabular leading-none mt-1.5">{value}</div>
    </div>
  );
}

function InfoField({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="mt-0.5 text-primary/60 shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold leading-none mb-1">{label}</div>
        <div className="text-[13.5px] font-semibold text-ink truncate">{value}</div>
      </div>
    </div>
  );
}

function tab(label: string, count = 0) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
        {count}
      </span>
    </span>
  );
}
