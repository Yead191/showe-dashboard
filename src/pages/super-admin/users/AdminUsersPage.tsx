import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Button, Dropdown, Drawer, Modal, Form, Input, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, MoreHorizontal, Eye, Ban, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, StatusBadge, Avatar, SectionTitle, DeleteConfirmModal } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { useGetUsersQuery, useUserSuspendMutation, type ApiUser } from '@/store/api/userApi';

const SEARCH_DEBOUNCE_MS = 300;

function getUserStatus(user: ApiUser): 'active' | 'suspended' {
  return user.isSuspended ? 'suspended' : user.status;
}

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<ApiUser | null>(null);

  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      setDebouncedSearch(trimmed);
      setPage(1);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) next.set('search', trimmed);
          else next.delete('search');
          return next;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  const { data: usersData, isLoading, isFetching } = useGetUsersQuery({
    page,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
  });
  const [suspendUser, { isLoading: isSuspending }] = useUserSuspendMutation();

  const users = usersData?.users ?? [];

  // Suspend modal state
  const [suspendModal, setSuspendModal] = useState<{ open: boolean; user: ApiUser | null }>({
    open: false,
    user: null,
  });
  const [suspendForm] = Form.useForm();

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: ApiUser | null }>({
    open: false,
    user: null,
  });

  const handleSuspend = (user: ApiUser) => {
    setSuspendModal({ open: true, user });
    suspendForm.setFieldsValue({ reason: '', duration: 7 });
  };

  const confirmSuspend = async () => {
    try {
      const values = await suspendForm.validateFields();
      if (!suspendModal.user) return;

      const response = await suspendUser({
        id: suspendModal.user._id,
        days: values.duration,
        reason: values.reason,
      }).unwrap();

      toast.success(response.message || `${suspendModal.user.name} has been suspended for ${values.duration} days.`);
      setSuspendModal({ open: false, user: null });
      suspendForm.resetFields();
    } catch (err) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to suspend user.')
          : 'Failed to suspend user.';
      toast.error(errorMessage);
    }
  };

  const handleDelete = (user: ApiUser) => {
    setDeleteModal({ open: true, user });
  };

  const confirmDelete = () => {
    toast.success(`${deleteModal.user?.name}'s account has been deleted.`);
    setDeleteModal({ open: false, user: null });
    if (selected?._id === deleteModal.user?._id) setSelected(null);
  };

  const columns: ColumnsType<ApiUser> = [
    {
      title: 'User',
      dataIndex: 'name',
      render: (_, user) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={user.image} name={user.name} size={36} />
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate">{user.name}</div>
            <div className="text-[12.5px] text-ink-faint truncate">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role: string) => <span className="chip capitalize">{role.toLowerCase()}</span>,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      render: (location, user) => (
        <span className="text-sm text-ink-muted">{location ?? user.country ?? '—'}</span>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'verified',
      render: (verified: boolean) => (
        <span className={verified ? 'text-success font-semibold' : 'text-ink-muted'}>
          {verified ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, user) => <StatusBadge status={getUserStatus(user)} />,
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      render: (date) => <span className="text-[12.5px] text-ink-muted">{formatDate(date)}</span>,
    },
    {
      title: '',
      align: 'right',
      render: (_, user) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <Eye size={13} />, label: 'View details' },
              { type: 'divider' },
              !user.isSuspended
                ? { key: 'suspend', icon: <Ban size={13} />, label: 'Suspend', danger: true }
                : null,
              { key: 'delete', icon: <Trash2 size={13} />, label: 'Delete account', danger: true },
            ].filter(Boolean) as never,
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === 'view') setSelected(user);
              else if (key === 'suspend') handleSuspend(user);
              else if (key === 'delete') handleDelete(user);
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>
        <Table
          rowKey="_id"
          dataSource={users}
          locale={{
            emptyText: debouncedSearch
              ? `No users match "${debouncedSearch}".`
              : 'No users found.',
          }}
          columns={columns}
          loading={isLoading || isFetching}
          pagination={{
            current: usersData?.pagination.page ?? page,
            pageSize: usersData?.pagination.limit ?? pageSize,
            total: usersData?.pagination.total ?? 0,
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
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
        okButtonProps={{ danger: true, className: 'rounded-xl h-10 px-6', loading: isSuspending }}
        cancelButtonProps={{ className: 'rounded-xl h-10 px-6', disabled: isSuspending }}
        className="premium-modal"
        centered
        closable={!isSuspending}
        maskClosable={!isSuspending}
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

function UserProfileDrawer({ user, onSuspend }: { user: ApiUser; onSuspend: () => void }) {
  const status = getUserStatus(user);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5">
        <Avatar src={user.image} name={user.name} size={72} ring />
        <div>
          <div className="font-display font-extrabold text-2xl text-ink leading-tight">{user.name}</div>
          <div className="text-[15px] text-ink-muted mt-0.5">{user.email}</div>
          <div className="mt-2 inline-flex items-center gap-2 text-[12.5px] text-ink-faint">
            <MapPin size={13} className="text-primary/60" /> {user.location ?? user.country ?? 'Unknown'} · joined {formatDate(user.createdAt)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-line bg-surface-sunken/40 p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">Role</div>
          <div className="font-display font-black text-3xl text-ink leading-none mt-2 capitalize">
            {user.role.toLowerCase()}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface-sunken/40 p-4">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold">Status</div>
          <div className="mt-2">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle title="Account details" />
        <div className="grid grid-cols-1 gap-3 mt-4">
          <InfoRow label="Verified" value={user.verified ? 'Yes' : 'No'} />
          <InfoRow label="Contact" value={user.contact ?? user.phone ?? 'Not provided'} />
          <InfoRow label="Organization" value={user.organization_name ?? '—'} />
          <InfoRow label="Organization type" value={user.organization_type ?? '—'} />
          <InfoRow label="Website" value={user.website ?? '—'} />
          {user.isSuspended && (
            <>
              <InfoRow label="Suspended reason" value={user.suspendedReason ?? '—'} />
              <InfoRow
                label="Suspended until"
                value={user.suspendedUntil ? formatDate(user.suspendedUntil) : '—'}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-line">
        {!user.isSuspended && (
          <Button
            danger
            size="large"
            className="rounded-xl flex-1 flex items-center justify-center gap-2 h-12"
            onClick={onSuspend}
          >
            <Ban size={16} />
            Suspend account
          </Button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-sunken/60 border border-line">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-semibold text-ink text-right">{value}</span>
    </div>
  );
}
