import { useMemo, useState } from 'react';
import { Table, Button, Dropdown, Tabs, Drawer, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, MoreHorizontal, Eye, Ban, Mail, Smartphone, RefreshCcw, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, StatusBadge, Avatar, SectionTitle } from '@/components/ui';
import { mockEndUsers } from '@/constants/mock-data';
import { mockRefundRequests } from '@/constants/mock-data';
import type { EndUser } from '@/types';
import { formatGBP, formatDate, timeAgo } from '@/lib/utils';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'end_users' | 'owners'>('end_users');
  const [selected, setSelected] = useState<EndUser | null>(null);

  const filtered = useMemo(() => {
    return mockEndUsers.filter((u) =>
      [u.name, u.email].some((v) => v.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search]);

  const columns: ColumnsType<EndUser> = [
    {
      title: 'User',
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
    { title: 'City', dataIndex: 'city', width: 120, render: (c) => <span className="text-sm text-ink-muted">{c ?? '—'}</span> },
    {
      title: 'Programmes',
      dataIndex: 'programmes_owned',
      width: 110,
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{v}</span>,
    },
    {
      title: 'Spent',
      dataIndex: 'total_spent',
      width: 100,
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{formatGBP(v)}</span>,
    },
    {
      title: 'Refunds',
      dataIndex: 'refund_requests',
      width: 90,
      render: (v: number) => (
        <span className={v > 0 ? 'text-warning font-semibold' : 'text-ink-muted'}>{v}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (s) => <StatusBadge status={s as 'active' | 'suspended'} />,
    },
    {
      title: 'Last active',
      dataIndex: 'last_active_at',
      width: 130,
      render: (d) => <span className="text-[12.5px] text-ink-muted">{timeAgo(d)}</span>,
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
              { key: 'email', icon: <Mail size={13} />, label: 'Send email' },
              { type: 'divider' },
              { key: 'suspend', icon: <Ban size={13} />, label: 'Suspend', danger: true },
              { key: 'delete', icon: <Trash2 size={13} />, label: 'Delete account', danger: true },
            ],
            onClick: ({ key }) => {
              if (key === 'view') setSelected(r);
              else if (key === 'delete')
                Modal.confirm({
                  title: 'Delete account?',
                  content: `${r.name}'s account and purchase history will be removed.`,
                  okText: 'Delete',
                  okButtonProps: { danger: true },
                  onOk: () => toast.success('Account deleted.'),
                });
              else toast.success('Action recorded (mock).');
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
        title="Users"
        description="Programme purchasers and venue owners. Click a row to see purchase history, devices and refund requests."
      />

      <Tabs
        activeKey={tab}
        onChange={(k) => setTab(k as 'end_users' | 'owners')}
        items={[
          {
            key: 'end_users',
            label: (
              <span className="inline-flex items-center gap-1.5">
                End users
                <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                  {mockEndUsers.length}
                </span>
              </span>
            ),
          },
          {
            key: 'owners',
            label: (
              <span className="inline-flex items-center gap-1.5">
                Venue owners
                <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                  6
                </span>
              </span>
            ),
          },
        ]}
        className="mb-4"
      />

      {tab === 'end_users' && (
        <Panel padded={false} className="overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center gap-3">
            <div className="relative max-w-xs w-full ml-auto">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="input-base !h-10 pl-10"
              />
            </div>
          </div>
          <Table
            rowKey="id"
            dataSource={filtered}
            columns={columns}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            onRow={(r) => ({ onClick: () => setSelected(r) })}
            rowClassName="cursor-pointer"
            scroll={{ x: 1080 }}
          />
        </Panel>
      )}

      {tab === 'owners' && (
        <Panel padded={false}>
          <p className="px-5 py-4 text-sm text-ink-muted">
            Venue owners are managed in <a className="text-primary font-semibold" href="/admin/venues">Venues & owners</a>.
          </p>
        </Panel>
      )}

      {/* User detail drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} width={520} title={selected?.name}>
        {selected && <UserProfileDrawer user={selected} />}
      </Drawer>
    </>
  );
}

function UserProfileDrawer({ user }: { user: EndUser }) {
  const userRefunds = mockRefundRequests.filter((r) => r.user_id === user.id);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar src={user.avatar_url} name={user.name} size={64} ring />
        <div>
          <div className="font-display font-bold text-xl text-ink">{user.name}</div>
          <div className="text-sm text-ink-muted">{user.email}</div>
          <div className="mt-1 inline-flex items-center gap-2 text-[12.5px] text-ink-faint">
            <MapPin size={11} /> {user.city ?? 'Unknown'} · joined {formatDate(user.joined_at)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface-sunken p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">Programmes</div>
          <div className="font-display font-extrabold text-2xl text-ink tabular leading-none mt-1">
            {user.programmes_owned}
          </div>
        </div>
        <div className="rounded-xl bg-surface-sunken p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">Spent</div>
          <div className="font-display font-extrabold text-2xl text-ink tabular leading-none mt-1">
            {formatGBP(user.total_spent)}
          </div>
        </div>
        <div className="rounded-xl bg-surface-sunken p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">Devices</div>
          <div className="font-display font-extrabold text-2xl text-ink tabular leading-none mt-1">
            {user.device_count}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle title="Refund requests" />
        {userRefunds.length === 0 ? (
          <p className="text-sm text-ink-muted">No refund requests on this account.</p>
        ) : (
          <ul className="space-y-2">
            {userRefunds.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-sunken">
                <RefreshCcw size={14} className="text-ink-muted" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-ink truncate">{r.programme_title}</div>
                  <div className="text-[12px] text-ink-faint">{timeAgo(r.requested_at)}</div>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <SectionTitle title="Devices" />
        <ul className="space-y-2">
          <li className="flex items-center gap-3 p-3 rounded-xl bg-surface-sunken">
            <Smartphone size={14} className="text-ink-muted" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-ink">iPhone 15 · Safari</div>
              <div className="text-[12px] text-ink-faint">Last seen {timeAgo(user.last_active_at)}</div>
            </div>
            <span className="chip chip-success">Trusted</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-2 pt-2 border-t border-line">
        <Button danger>Suspend</Button>
        <Button>Send email</Button>
      </div>
    </div>
  );
}
