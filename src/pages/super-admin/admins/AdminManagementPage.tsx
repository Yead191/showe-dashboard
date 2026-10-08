import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Button, Dropdown, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, StatusBadge, Avatar, DeleteConfirmModal } from '@/components/ui';
import { formatDate, timeAgo } from '@/lib/utils';
import {
  useGetAdminsQuery,
  useDeleteAdminMutation,
} from '@/store/api/adminApi';
import type { AdminUser, AdminRole } from '@/types/admin';
import { AdminRoleBadge } from './components/AdminRoleBadge';
import { AdminPermissionsBadge } from './components/AdminPermissionsBadge';
import { AdminStats } from './components/AdminStats';
import { AdminFormModal } from './components/AdminFormModal';

const SEARCH_DEBOUNCE_MS = 300;

export default function AdminManagementPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';
  const roleFromUrl = searchParams.get('role') ?? 'all';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [selectedRoleTab, setSelectedRoleTab] = useState<string>(roleFromUrl);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState<AdminUser | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; admin: AdminUser | null }>({
    open: false,
    admin: null,
  });

  // Sync search from URL
  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  // Debounce search update
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

  // Role filter tab update
  const handleRoleTabChange = (key: string) => {
    setSelectedRoleTab(key);
    setPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (key !== 'all') next.set('role', key);
        else next.delete('role');
        return next;
      },
      { replace: true }
    );
  };

  const {
    data: adminsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminsQuery({
    page,
    limit: pageSize,
    searchTerm: debouncedSearch || undefined,
    role: selectedRoleTab !== 'all' ? selectedRoleTab : undefined,
  });

  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const admins = adminsResponse?.data ?? [];
  const pagination = adminsResponse?.pagination;

  // Handlers
  const handleOpenCreateModal = () => {
    setAdminToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (admin: AdminUser) => {
    setAdminToEdit(admin);
    setFormModalOpen(true);
  };

  const handleOpenDeleteModal = (admin: AdminUser) => {
    setDeleteModal({ open: true, admin });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.admin) return;
    const admin = deleteModal.admin;
    try {
      const res = await deleteAdmin(admin._id).unwrap();
      toast.success(res?.message || `${admin.name} was successfully removed.`);
      setDeleteModal({ open: false, admin: null });
    } catch (err: unknown) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            'Failed to delete administrator.')
          : 'Failed to delete administrator.';
      toast.error(errorMessage);
    }
  };

  const handleViewDetails = (admin: AdminUser) => {
    navigate(`/admin/admins/${admin._id}`, { state: { admin } });
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'Administrator',
      dataIndex: 'name',
      render: (_, admin) => (
        <div
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
          onClick={() => handleViewDetails(admin)}
        >
          <div className="relative">
            <Avatar src={admin.image ?? undefined} name={admin.name} size={40} ring />
            {admin.verified && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shadow-xs"
                title="Verified Administrator"
              >
                <CheckCircle2 size={11} strokeWidth={2.5} />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-ink group-hover:text-primary transition-colors flex items-center gap-1.5 truncate">
              {admin.name}
            </div>
            <div className="text-[12.5px] text-ink-faint truncate font-mono">
              {admin.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Platform Role',
      dataIndex: 'role',
      width: 160,
      render: (role: AdminRole) => <AdminRoleBadge role={role} size="md" />,
    },
    {
      title: 'Assigned Permissions',
      dataIndex: 'permissions',
      render: (permissions: string[]) => (
        <AdminPermissionsBadge permissions={permissions} maxVisible={3} showIcon />
      ),
    },
    {
      title: 'Account Status',
      dataIndex: 'status',
      width: 140,
      render: (_, admin) => {
        const isSuspended = admin.isSuspended || admin.status === 'suspended';
        return <StatusBadge status={isSuspended ? 'suspended' : (admin.status || 'active')} />;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 160,
      render: (date) => (
        <div className="min-w-0">
          <div className="text-xs font-medium text-ink">{formatDate(date)}</div>
          <div className="text-[11px] text-ink-faint">{timeAgo(date)}</div>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'right',
      render: (_, admin) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <Eye size={14} />,
                label: 'View details',
              },
              {
                key: 'edit',
                icon: <Edit2 size={14} />,
                label: 'Edit permissions',
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <Trash2 size={14} />,
                label: 'Delete admin',
                danger: true,
              },
            ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === 'view') handleViewDetails(admin);
              else if (key === 'edit') handleOpenEditModal(admin);
              else if (key === 'delete') handleOpenDeleteModal(admin);
            },
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreHorizontal size={16} />}
            className="hover:bg-surface-sunken rounded-lg"
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
        title="Admin Management"
        description="Provision platform administrators, manage role authority, and configure delegated module permissions."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              icon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />}
              onClick={() => refetch()}
              className="h-10 px-3.5 rounded-xl border-line font-medium text-ink-muted hover:text-ink"
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<UserPlus size={15} />}
              onClick={handleOpenCreateModal}
              className="h-10 px-4 rounded-xl font-bold shadow-md shadow-primary/20 flex items-center gap-2"
            >
              Add New Admin
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <AdminStats admins={admins} totalFromApi={pagination?.total} />

      {/* Main Table Panel */}
      <Panel padded={false} className="overflow-hidden">
        {/* Filtering & Search Bar */}
        <div className="px-5 py-3 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-raised/50">
          <Tabs
            activeKey={selectedRoleTab}
            onChange={handleRoleTabChange}
            className="admin-role-tabs [&_.ant-tabs-nav]:!mb-0"
            items={[
              { key: 'all', label: 'All Administrators' },
              { key: 'SUPER_ADMIN', label: 'Super Admins' },
              { key: 'ADMIN', label: 'Standard Admins' },
            ]}
          />

          <div className="relative max-w-xs w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="input-base !h-9 pl-9 pr-3 text-xs w-full"
            />
          </div>
        </div>

        {/* Administrators Data Table */}
        <Table
          rowKey="_id"
          dataSource={admins}
          columns={columns}
          loading={isLoading || isFetching}
          onRow={(record) => ({
            onClick: () => handleViewDetails(record),
            className: 'cursor-pointer hover:bg-surface-sunken/40 transition-colors',
          })}
          locale={{
            emptyText: debouncedSearch ? (
              <div className="py-12 text-center">
                <ShieldCheck size={36} className="mx-auto text-ink-faint/60 mb-2" />
                <div className="font-semibold text-ink">No administrators found</div>
                <div className="text-xs text-ink-muted mt-1">
                  No admin matched your search query "{debouncedSearch}".
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <ShieldCheck size={36} className="mx-auto text-primary/50 mb-3" />
                <div className="font-semibold text-ink text-base">No administrators provisioned</div>
                <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                  Click the button below to provision your first platform administrator.
                </p>
                <Button
                  type="primary"
                  icon={<UserPlus size={14} />}
                  onClick={handleOpenCreateModal}
                  className="mt-4 rounded-xl font-bold"
                >
                  Create Admin
                </Button>
              </div>
            ),
          }}
          pagination={{
            current: pagination?.page ?? page,
            pageSize: pagination?.limit ?? pageSize,
            total: pagination?.total ?? admins.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (total, range) => (
              <span className="text-xs text-ink-muted font-medium">
                Showing {range[0]}–{range[1]} of {total} admins
              </span>
            ),
            className: '!px-5 !py-3 !mb-0 border-t border-line',
          }}
        />
      </Panel>

      {/* Create / Edit Admin Modal */}
      <AdminFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setAdminToEdit(null);
        }}
        adminToEdit={adminToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModal.open}
        targetName={deleteModal.admin?.name}
        title="Delete Administrator?"
        description="This will permanently revoke their access credentials and delete their account from the platform. This action cannot be reversed."
        confirmText="Revoke & Delete"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ open: false, admin: null })}
      />
    </>
  );
}
