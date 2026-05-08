import { useMemo, useState } from 'react';
import { Table, Button, Dropdown, Drawer, Modal, Form, Input, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, MoreHorizontal, Eye, Ban, RefreshCcw, Trash2, MapPin, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, StatusBadge, Avatar, SectionTitle, DeleteConfirmModal } from '@/components/ui';
import { mockEndUsers, mockRefundRequests, mockTransactions } from '@/constants/mock-data';
import type { EndUser } from '@/types';
import { formatGBP, formatDate, timeAgo } from '@/lib/utils';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<EndUser | null>(null);

  // Suspend modal state
  const [suspendModal, setSuspendModal] = useState<{ open: boolean; user: EndUser | null }>({
    open: false,
    user: null,
  });
  const [suspendForm] = Form.useForm();

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: EndUser | null }>({
    open: false,
    user: null,
  });

  const filtered = useMemo(() => {
    return mockEndUsers.filter((u) =>
      [u.name, u.email].some((v) => v.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search]);

  const handleSuspend = (user: EndUser) => {
    setSuspendModal({ open: true, user });
    suspendForm.setFieldsValue({ reason: '', duration: 7 });
  };

  const confirmSuspend = () => {
    suspendForm.validateFields().then((values) => {
      toast.success(`${suspendModal.user?.name} has been suspended for ${values.duration} days.`);
      setSuspendModal({ open: false, user: null });
    });
  };

  const handleDelete = (user: EndUser) => {
    setDeleteModal({ open: true, user });
  };

  const confirmDelete = () => {
    // Mock delete action
    toast.success(`${deleteModal.user?.name}'s account has been deleted.`);
    setDeleteModal({ open: false, user: null });
    if (selected?.id === deleteModal.user?.id) setSelected(null);
  };

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
    { title: 'City', dataIndex: 'city', render: (c) => <span className="text-sm text-ink-muted">{c ?? '—'}</span> },
    {
      title: 'Programmes',
      dataIndex: 'programmes_owned',
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{v}</span>,
    },
    {
      title: 'Spent',
      dataIndex: 'total_spent',
      render: (v: number) => <span className="font-display font-bold tabular text-ink">{formatGBP(v)}</span>,
    },
    {
      title: 'Refunds',
      dataIndex: 'refund_requests',
      render: (v: number) => (
        <span className={v > 0 ? 'text-warning font-semibold' : 'text-ink-muted'}>{v}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <StatusBadge status={s as 'active' | 'suspended'} />,
    },
    {
      title: 'Last active',
      dataIndex: 'last_active_at',
      render: (d) => <span className="text-[12.5px] text-ink-muted">{timeAgo(d)}</span>,
    },
    {
      title: '',
      align: 'right',
      render: (_, r) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <Eye size={13} />, label: 'View details' },
              { type: 'divider' },
              { key: 'suspend', icon: <Ban size={13} />, label: 'Suspend', danger: true },
              { key: 'delete', icon: <Trash2 size={13} />, label: 'Delete account', danger: true },
            ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === 'view') setSelected(r);
              else if (key === 'suspend') handleSuspend(r);
              else if (key === 'delete') handleDelete(r);
            },
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreHorizontal size={15} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Network"
        title="Users"
        description="Programme purchasers and venue owners. Manage user status and view detailed purchase history."
      />


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
          // Row click disabled as per request
          scroll={{ x: 1080 }}
        />
      </Panel>


      {/* User detail drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        width={520}
        title={selected ? `User Profile: ${selected.name}` : ''}
        className="premium-drawer"
      >
        {selected && <UserProfileDrawer user={selected} onSuspend={() => handleSuspend(selected)} />}
      </Drawer>

      {/* Suspend Modal */}
      <Modal
        title="Suspend User Account"
        open={suspendModal.open}
        onOk={confirmSuspend}
        onCancel={() => setSuspendModal({ open: false, user: null })}
        okText="Confirm Suspension"
        okButtonProps={{ danger: true, className: 'rounded-xl h-10 px-6' }}
        cancelButtonProps={{ className: 'rounded-xl h-10 px-6' }}
        className="premium-modal"
        centered
      >
        <Form form={suspendForm} layout="vertical" className="mt-4">
          <div className="p-4 rounded-xl bg-error/5 border border-error/10 mb-6">
            <p className="text-sm text-error font-medium">
              Suspending <strong>{suspendModal.user?.name}</strong> will prevent them from accessing their purchased programmes.
            </p>
          </div>
          <Form.Item
            name="duration"
            label="Duration (days)"
            rules={[{ required: true }]}
            initialValue={7}
          >
            <InputNumber min={1} max={365} className="w-full input-base flex items-center" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason for suspension"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <Input.TextArea placeholder="e.g. Suspicious refund activity or Terms of Service violation" className="input-base" rows={3} />
          </Form.Item>

        </Form>
      </Modal>

      {/* Shared Delete Confirmation */}
      <DeleteConfirmModal
        open={deleteModal.open}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, user: null })}
        title="Delete User Account"
        description="This will permanently remove the user, their purchase history, and all associated data."
        targetName={deleteModal.user?.name}
        confirmText="Delete account"
      />
    </>
  );
}

function UserProfileDrawer({ user, onSuspend }: { user: EndUser; onSuspend: () => void }) {
  const userRefunds = mockRefundRequests.filter((r) => r.user_id === user.id);
  const userPurchases = mockTransactions.filter(t => t.user_id === user.id && t.type === 'programme_purchase');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5">
        <Avatar src={user.avatar_url} name={user.name} size={72} ring />
        <div>
          <div className="font-display font-extrabold text-2xl text-ink leading-tight">{user.name}</div>
          <div className="text-[15px] text-ink-muted mt-0.5">{user.email}</div>
          <div className="mt-2 inline-flex items-center gap-2 text-[12.5px] text-ink-faint">
            <MapPin size={13} className="text-primary/60" /> {user.city ?? 'Unknown'} · joined {formatDate(user.joined_at)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-line bg-surface-sunken/40 p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">Total Programmes</div>
          <div className="font-display font-black text-3xl text-ink tabular leading-none mt-2">
            {user.programmes_owned}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface-sunken/40 p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">Total Spent</div>
          <div className="font-display font-black text-3xl text-ink tabular leading-none mt-2">
            {formatGBP(user.total_spent)}
          </div>
        </div>
      </div>

      {/* Purchased Programmes List */}
      <div>
        <SectionTitle
          title="Purchased programmes"
          action={<span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">{userPurchases.length} total</span>}
        />
        {userPurchases.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-line flex flex-col items-center justify-center text-center">
            <BookOpen size={24} className="text-ink-faint mb-2" />
            <p className="text-sm text-ink-muted">No programmes purchased yet.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {userPurchases.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-raised border border-line shadow-sm hover:border-line-strong transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] text-ink truncate">
                    {p.description.split(' · ')[1] || p.description}
                  </div>
                  <div className="text-[12px] text-ink-faint flex items-center gap-1.5 mt-0.5">
                    {p.venue_name} · {formatDate(p.created_at)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-sm text-ink">{formatGBP(p.amount_pence / 100)}</div>
                  <div className="text-[10px] uppercase font-black text-success tracking-tighter">Paid</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <SectionTitle title="Refund requests" />
        {userRefunds.length === 0 ? (
          <p className="text-sm text-ink-muted py-2">No refund requests on this account.</p>
        ) : (
          <ul className="space-y-2.5">
            {userRefunds.map((r) => (
              <li key={r.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-sunken/60 border border-transparent hover:border-line transition-colors">
                <RefreshCcw size={16} className="text-ink-muted" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] text-ink truncate">{r.programme_title}</div>
                  <div className="text-[12px] text-ink-faint flex items-center gap-1.5 mt-0.5">
                    <Clock size={11} /> {timeAgo(r.requested_at)}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3 pt-6 border-t border-line">
        <Button
          danger
          size="large"
          className="rounded-xl flex-1 flex items-center justify-center gap-2 h-12"
          onClick={onSuspend}
        >
          <Ban size={16} />
          Suspend account
        </Button>
      </div>
    </div>
  );
}
