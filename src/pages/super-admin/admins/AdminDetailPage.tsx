import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "antd";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Edit2,
  Trash2,
  Check,
  X,
  FileCode2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Panel,
  StatusBadge,
  Avatar,
  DeleteConfirmModal,
} from "@/components/ui";
import { formatDate, formatDateTime, timeAgo } from "@/lib/utils";
import {
  useGetAdminByIdQuery,
  useDeleteAdminMutation,
  useGetAdminsQuery,
} from "@/store/api/adminApi";
import { SYSTEM_PERMISSIONS, type AdminUser } from "@/types/admin";
import { AdminRoleBadge } from "./components/AdminRoleBadge";
import { AdminFormModal } from "./components/AdminFormModal";

export default function AdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // State from navigation if available
  const stateAdmin = (location.state as { admin?: AdminUser } | undefined)
    ?.admin;

  // Single admin query
  const {
    data: fetchedAdmin,
    isLoading: isFetchingAdmin,
    isError,
  } = useGetAdminByIdQuery(id ?? "", {
    skip: !id,
  });

  // Fallback to getAdmins list query if single fetch is not supported by API
  const { data: allAdminsResponse } = useGetAdminsQuery(undefined, {
    skip: Boolean(fetchedAdmin || stateAdmin),
  });

  const adminFromList = allAdminsResponse?.data.find((a) => a._id === id);

  // Resolved admin
  const admin: AdminUser | undefined =
    fetchedAdmin ?? stateAdmin ?? adminFromList;

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleDelete = async () => {
    if (!admin) return;
    try {
      const res = await deleteAdmin(admin._id).unwrap();
      toast.success(res?.message || `${admin.name} was successfully removed.`);
      navigate("/admin/admins", { replace: true });
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Failed to delete administrator.")
          : "Failed to delete administrator.";
      toast.error(errorMessage);
    }
  };

  if (isFetchingAdmin && !admin) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <div className="text-sm font-semibold text-ink">
          Loading administrator profile...
        </div>
      </div>
    );
  }

  if ((!admin && !isFetchingAdmin) || (isError && !admin)) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={30} />
        </div>
        <h2 className="font-display font-bold text-2xl text-ink">
          Administrator Not Found
        </h2>
        <p className="text-sm text-ink-muted mt-2 mb-6">
          The requested administrator account could not be found or has been
          removed.
        </p>
        <Button
          type="primary"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate("/admin/admins")}
          className="rounded-xl font-bold"
        >
          Back to Admin Directory
        </Button>
      </div>
    );
  }

  if (!admin) return null;

  const isSuspended = admin.isSuspended || admin.status === "suspended";
  const assignedPermissions = new Set(
    (admin.permissions || []).map((p) => p.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Nav / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/admin/admins")}
            className="rounded-xl h-10 w-10 p-0 flex items-center justify-center border-line hover:bg-surface-sunken"
            title="Return to admins"
          />
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-faint">
              <Link
                to="/admin/admins"
                className="hover:text-primary transition-colors"
              >
                Admin Management
              </Link>
              <span>/</span>
              <span className="text-ink truncate max-w-[200px]">
                {admin.name}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-ink mt-0.5">
              Administrator Profile
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            icon={<Mail size={14} />}
            href={`mailto:${admin.email}`}
            className="h-10 px-3.5 rounded-xl border-line font-medium text-ink-muted hover:text-ink"
          >
            Send Email
          </Button>
          <Button
            icon={<Edit2 size={14} />}
            onClick={() => setEditModalOpen(true)}
            className="h-10 px-3.5 rounded-xl border-line font-medium text-ink hover:text-primary"
          >
            Edit Permissions
          </Button>
          <Button
            danger
            icon={<Trash2 size={14} />}
            onClick={() => setDeleteModalOpen(true)}
            className="h-10 px-3.5 rounded-xl font-semibold"
          >
            Delete Admin
          </Button>
        </div>
      </div>

      {/* Hero Profile Panel */}
      <div className="surface-card p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-surface-raised via-surface-raised to-primary/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar
                src={admin.image ?? undefined}
                name={admin.name}
                size={76}
                ring
              />
              {admin.verified && (
                <span
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md ring-2 ring-white"
                  title="Verified Platform Admin"
                >
                  <CheckCircle2 size={14} strokeWidth={3} />
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h2 className="font-display font-extrabold text-2xl text-ink">
                  {admin.name}
                </h2>
                <AdminRoleBadge role={admin.role} size="md" />
                <StatusBadge
                  status={isSuspended ? "suspended" : admin.status || "active"}
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5 font-mono">
                  <Mail size={13} className="text-ink-faint" />
                  {admin.email}
                </span>

                {admin.contact && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-ink-faint" />
                    {admin.contact}
                  </span>
                )}

                {admin.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-ink-faint" />
                    {admin.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick ID metadata pill */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-surface-sunken/80 border border-line rounded-lg px-3 py-1.5">
              <FileCode2 size={13} className="text-ink-faint" />
              <span className="text-[11px] font-mono text-ink-muted">
                ID: {admin._id}
              </span>
              <button
                onClick={() => handleCopy(admin._id, "Admin ID")}
                className="text-ink-faint hover:text-ink transition-colors ml-1"
                title="Copy ID"
              >
                <Copy size={12} />
              </button>
            </div>
            <div className="text-[11.5px] text-ink-faint flex items-center gap-1.5">
              <Calendar size={12} />
              <span>Registered {formatDate(admin.createdAt)}</span>
              <span>•</span>
              <span>{timeAgo(admin.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 (2-span): Access Control & Permissions Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <Panel
            title="Platform Access Rights & Entitlements"
            description={`${admin.permissions?.length ?? 0} active permissions granted to this administrator`}
            action={
              <Button
                size="small"
                icon={<Edit2 size={12} />}
                onClick={() => setEditModalOpen(true)}
                className="text-xs font-semibold rounded-lg"
              >
                Configure
              </Button>
            }
          >
            {admin.role === "SUPER_ADMIN" && (
              <div className="mb-5 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#8A5C00] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm text-ink">
                    Super Administrator Privileges
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                    This account holds master privileges. Even if specific
                    module checkboxes are not checked below, Super Admins have
                    inherent authorization across all dashboard operations.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SYSTEM_PERMISSIONS.map((perm) => {
                const isGranted =
                  assignedPermissions.has(perm.key.toLowerCase()) ||
                  admin.role === "SUPER_ADMIN";

                return (
                  <div
                    key={perm.key}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isGranted
                        ? "bg-primary/5 border-primary/25 shadow-2xs"
                        : "bg-surface-sunken/40 border-line/70 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                            isGranted
                              ? "bg-primary text-white"
                              : "bg-surface-sunken text-ink-faint border border-line"
                          }`}
                        >
                          {isGranted ? (
                            <Check size={13} strokeWidth={3} />
                          ) : (
                            <X size={12} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-ink">
                            {perm.key}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
                            {perm.category}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isGranted
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-sunken text-ink-faint"
                        }`}
                      >
                        {isGranted ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-ink-muted mt-2 leading-relaxed">
                      {perm.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Any custom permissions outside SYSTEM_PERMISSIONS */}
            {admin.permissions?.some(
              (p) =>
                !SYSTEM_PERMISSIONS.some(
                  (sp) => sp.key.toLowerCase() === p.toLowerCase(),
                ),
            ) && (
              <div className="mt-5 pt-4 border-t border-line">
                <div className="text-xs font-bold text-ink mb-2">
                  Custom Scope Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {admin.permissions
                    .filter(
                      (p) =>
                        !SYSTEM_PERMISSIONS.some(
                          (sp) => sp.key.toLowerCase() === p.toLowerCase(),
                        ),
                    )
                    .map((custom) => (
                      <span
                        key={custom}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5"
                      >
                        <Shield size={12} />
                        {custom}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* Column 2 (1-span): Security, Account Details & Governance */}
        <div className="space-y-6">
          {/* Account Governance Card */}
          <Panel
            title="Account Governance"
            description="Status and verification checks"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-line/60">
                <span className="text-xs text-ink-muted">Account Status</span>
                <StatusBadge
                  status={isSuspended ? "suspended" : admin.status || "active"}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-line/60">
                <span className="text-xs text-ink-muted">Email Verified</span>
                <span className="text-xs font-semibold text-ink flex items-center gap-1">
                  {admin.verified ? (
                    <>
                      <CheckCircle2 size={13} className="text-success" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} className="text-warning" />
                      <span>Unverified</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-line/60">
                <span className="text-xs text-ink-muted">Assigned Role</span>
                <AdminRoleBadge role={admin.role} size="sm" />
              </div>

              {admin.isSuspended && (
                <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs space-y-1.5">
                  <div className="font-bold text-danger flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Account Suspended
                  </div>
                  {admin.suspendedReason && (
                    <div className="text-ink-muted">
                      <strong>Reason:</strong> {admin.suspendedReason}
                    </div>
                  )}
                  {admin.suspendedUntil && (
                    <div className="text-ink-muted">
                      <strong>Until:</strong> {formatDate(admin.suspendedUntil)}
                    </div>
                  )}
                  {admin.suspendedDays && (
                    <div className="text-ink-muted">
                      <strong>Duration:</strong> {admin.suspendedDays} days
                    </div>
                  )}
                </div>
              )}
            </div>
          </Panel>

          {/* Audit Timestamps */}
          <Panel
            title="System Timestamps"
            description="Creation and sync records"
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted flex items-center gap-1.5">
                  <Calendar size={13} className="text-ink-faint" />
                  Account Created
                </span>
                <span className="font-medium text-ink">
                  {formatDateTime(admin.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-muted flex items-center gap-1.5">
                  <Clock size={13} className="text-ink-faint" />
                  Last Updated
                </span>
                <span className="font-medium text-ink">
                  {formatDateTime(admin.updatedAt)}
                </span>
              </div>

              {admin.__v !== undefined && (
                <div className="flex items-center justify-between pt-2 border-t border-line/60">
                  <span className="text-ink-muted">Record Version</span>
                  <span className="font-mono text-ink-faint">v{admin.__v}</span>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Edit Admin Modal */}
      <AdminFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        adminToEdit={admin}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        targetName={admin.name}
        title="Delete Administrator?"
        description="This will permanently delete this administrator account and invalidate all session tokens. This action is irreversible."
        confirmText="Confirm Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
