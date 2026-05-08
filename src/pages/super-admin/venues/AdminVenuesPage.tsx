import { useMemo, useState } from 'react';
import { Table, Button, Dropdown, Tabs, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  Crown,
  CheckCircle2,
  Plus,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, TierBadge, StatusBadge, Avatar } from '@/components/ui';
import { mockVenueOwners } from '@/constants/venue-owners';
import type { VenueOwner } from '@/types/venue';
import { formatGBP, formatDate, timeAgo } from '@/lib/utils';

export default function AdminVenuesPage() {
  const [search, setSearch] = useState('');
  const [statusKey, setStatusKey] = useState('all');

  const filtered = useMemo(() => {
    return mockVenueOwners.filter((o) => {
      if (statusKey !== 'all' && o.status !== statusKey) return false;
      if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, statusKey]);

  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: mockVenueOwners.length };
    for (const o of mockVenueOwners) acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, []);

  const columns: ColumnsType<VenueOwner> = [
    {
      title: 'Owner',
      dataIndex: 'name',
      render: (_, r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={r.avatar_url} name={r.name} size={36} />
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate">{r.name}</div>
            <div className="text-[12.5px] text-ink-faint truncate">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'org_type',
      width: 110,
      render: (t: string) => <span className="chip capitalize">{t}</span>,
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      width: 110,
      render: (t) => <TierBadge tier={t} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 130,
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Venues',
      dataIndex: 'venues_count',
      width: 80,
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{v}</span>,
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      width: 120,
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{formatGBP(v, { compact: true })}</span>,
    },
    {
      title: 'Joined',
      dataIndex: 'joined_at',
      width: 130,
      render: (d: string) => <span className="text-[12.5px] text-ink-muted">{formatDate(d)}</span>,
    },
    {
      title: 'Last active',
      dataIndex: 'last_login_at',
      width: 110,
      render: (d?: string) => (
        <span className="text-[12.5px] text-ink-muted">{d ? timeAgo(d) : 'Never'}</span>
      ),
    },
    {
      title: '',
      width: 50,
      align: 'right',
      render: (_, r) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <Eye size={13} />, label: 'View profile' },
              { key: 'tier', icon: <Crown size={13} />, label: 'Override tier' },
              { key: 'message', icon: <Mail size={13} />, label: 'Send message' },
              { type: 'divider' },
              r.status === 'pending'
                ? { key: 'approve', icon: <CheckCircle2 size={13} />, label: 'Approve' }
                : null,
              r.status !== 'suspended'
                ? { key: 'suspend', icon: <Ban size={13} />, label: 'Suspend', danger: true }
                : { key: 'unsuspend', icon: <CheckCircle2 size={13} />, label: 'Unsuspend' },
            ].filter(Boolean) as never,
            onClick: ({ key }) => {
              if (key === 'approve') toast.success(`${r.name} approved.`);
              else if (key === 'suspend') {
                Modal.confirm({
                  title: `Suspend ${r.name}?`,
                  content: 'They will lose access to their dashboard immediately.',
                  okText: 'Suspend',
                  okButtonProps: { danger: true },
                  onOk: () => toast.success('Owner suspended.'),
                });
              } else toast.success('Action recorded (mock).');
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
        description="All venue owners across the platform. Approve pending sign-ups, override tiers and manage suspensions."
        actions={
          <>
            <Button>Export CSV</Button>
            <Button type="primary" icon={<Plus size={14} />}>
              Invite venue owner
            </Button>
          </>
        }
      />

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-3 border-b border-line">
          <Tabs
            activeKey={statusKey}
            onChange={setStatusKey}
            items={[
              { key: 'all', label: tab('All', counts.all) },
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
              placeholder="Search owners by name or email"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        <Table
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1100 }}
        />
      </Panel>
    </>
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
