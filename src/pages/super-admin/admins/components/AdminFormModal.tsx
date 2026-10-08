import { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Tag } from 'antd';
import {
  Mail,
  User,
  Lock,
  ShieldCheck,
  Crown,
  KeyRound,
  Check,
  Plus,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useCreateAdminMutation,
  useUpdateAdminMutation,
} from '@/store/api/adminApi';
import {
  SYSTEM_PERMISSIONS,
  type AdminRole,
  type AdminUser,
  type CreateAdminPayload,
  type UpdateAdminPayload,
} from '@/types/admin';

interface AdminFormModalProps {
  open: boolean;
  onClose: () => void;
  adminToEdit?: AdminUser | null;
  onSuccess?: (admin?: AdminUser) => void;
}

export function AdminFormModal({
  open,
  onClose,
  adminToEdit,
  onSuccess,
}: AdminFormModalProps) {
  const [form] = Form.useForm();
  const isEditing = Boolean(adminToEdit);

  const [selectedRole, setSelectedRole] = useState<AdminRole>('ADMIN');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['Users']);
  const [customTagInput, setCustomTagInput] = useState('');

  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (adminToEdit) {
        setSelectedRole(adminToEdit.role);
        setSelectedPermissions(adminToEdit.permissions ?? []);
        form.setFieldsValue({
          name: adminToEdit.name,
          email: adminToEdit.email,
          password: '',
          role: adminToEdit.role,
        });
      } else {
        setSelectedRole('ADMIN');
        setSelectedPermissions(['Users']);
        form.resetFields();
        form.setFieldsValue({
          role: 'ADMIN',
        });
      }
    }
  }, [open, adminToEdit, form]);

  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey)
        ? prev.filter((p) => p !== prev.find((item) => item.toLowerCase() === permKey.toLowerCase()) && p !== permKey)
        : [...prev, permKey]
    );
  };

  const selectAllPermissions = () => {
    const allKeys = Array.from(
      new Set([...SYSTEM_PERMISSIONS.map((p) => p.key), ...selectedPermissions])
    );
    setSelectedPermissions(allKeys);
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleAddCustomPermission = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!selectedPermissions.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedPermissions((prev) => [...prev, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleRoleChange = (role: AdminRole) => {
    setSelectedRole(role);
    form.setFieldValue('role', role);
    if (role === 'SUPER_ADMIN' && selectedPermissions.length === 0) {
      selectAllPermissions();
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing && adminToEdit) {
        const payload: UpdateAdminPayload = {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          role: selectedRole,
          permissions: selectedPermissions,
        };

        if (values.password && values.password.trim()) {
          payload.password = values.password.trim();
        }

        const res = await updateAdmin({
          id: adminToEdit._id,
          data: payload,
        }).unwrap();

        toast.success(res?.message || 'Admin updated successfully.');
        onSuccess?.(res?.data);
        onClose();
      } else {
        const payload: CreateAdminPayload = {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password.trim(),
          role: selectedRole,
          permissions: selectedPermissions,
        };

        const res = await createAdmin(payload).unwrap();
        toast.success(res?.message || 'Admin created successfully.');
        onSuccess?.(res?.data);
        onClose();
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'errorFields' in err) {
        return;
      }
      const errorMessage =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            'Failed to save admin.')
          : 'Failed to save admin. Please check your credentials and try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      destroyOnClose
      className="premium-modal admin-form-modal"
    >
      <div className="p-1">
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-line mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {isEditing ? <ShieldCheck size={24} /> : <Sparkles size={24} />}
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-ink leading-tight">
              {isEditing ? `Edit Admin: ${adminToEdit?.name}` : 'Create New Administrator'}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {isEditing
                ? 'Update account credentials, authorization role, and delegated permissions.'
                : 'Provision a new dashboard account with granular module access.'}
            </p>
          </div>
        </div>

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {/* Basic Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label={<span className="field-label">Full Name</span>}
              rules={[{ required: true, message: 'Full name is required.' }]}
            >
              <Input
                prefix={<User size={15} className="text-ink-faint mr-1.5" />}
                placeholder="e.g. John Doe"
                className="input-base !h-11"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="field-label">Email Address</span>}
              rules={[
                { required: true, message: 'Email address is required.' },
                { type: 'email', message: 'Enter a valid email address.' },
              ]}
            >
              <Input
                prefix={<Mail size={15} className="text-ink-faint mr-1.5" />}
                placeholder="e.g. admin@showe.co.uk"
                className="input-base !h-11"
              />
            </Form.Item>
          </div>

          {/* Password */}
          <Form.Item
            name="password"
            label={
              <div className="flex items-center justify-between w-full">
                <span className="field-label">
                  {isEditing ? 'New Password (Optional)' : 'Secure Password'}
                </span>
                {isEditing && (
                  <span className="text-[11px] text-ink-faint font-normal">
                    Leave blank to preserve current password
                  </span>
                )}
              </div>
            }
            rules={[
              {
                required: !isEditing,
                message: 'Password is required for new accounts.',
              },
              {
                min: 6,
                message: 'Password must be at least 6 characters.',
              },
            ]}
          >
            <Input.Password
              prefix={<Lock size={15} className="text-ink-faint mr-1.5" />}
              placeholder={
                isEditing
                  ? 'Enter new password to change...'
                  : 'Enter strong password (min 6 chars)...'
              }
              className="input-base !h-11"
            />
          </Form.Item>

          {/* Role Selection */}
          <div className="mb-5">
            <span className="field-label block mb-2">Assign Platform Role</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ADMIN Card */}
              <div
                onClick={() => handleRoleChange('ADMIN')}
                className={cn(
                  'relative p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none',
                  selectedRole === 'ADMIN'
                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                    : 'border-line bg-surface-raised hover:bg-surface-sunken/60 hover:border-line-strong'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        selectedRole === 'ADMIN'
                          ? 'bg-primary text-white'
                          : 'bg-surface-sunken text-ink-muted'
                      )}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-ink">Admin</div>
                      <div className="text-[11px] text-ink-muted">Delegated Operator</div>
                    </div>
                  </div>
                  {selectedRole === 'ADMIN' && (
                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-ink-muted mt-2.5 leading-relaxed">
                  Restricted access strictly scoped to the specific permissions checked below.
                </p>
              </div>

              {/* SUPER_ADMIN Card */}
              <div
                onClick={() => handleRoleChange('SUPER_ADMIN')}
                className={cn(
                  'relative p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none',
                  selectedRole === 'SUPER_ADMIN'
                    ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30'
                    : 'border-line bg-surface-raised hover:bg-surface-sunken/60 hover:border-line-strong'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        selectedRole === 'SUPER_ADMIN'
                          ? 'bg-[#8A5C00] text-white'
                          : 'bg-surface-sunken text-ink-muted'
                      )}
                    >
                      <Crown size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-ink">Super Admin</div>
                      <div className="text-[11px] text-[#8A5C00] font-semibold">
                        Master Authority
                      </div>
                    </div>
                  </div>
                  {selectedRole === 'SUPER_ADMIN' && (
                    <div className="w-5 h-5 rounded-full bg-[#8A5C00] text-white flex items-center justify-center text-xs">
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-ink-muted mt-2.5 leading-relaxed">
                  Full unrestricted platform privileges including admin provisioning, payments & system policies.
                </p>
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="mb-6 pt-3 border-t border-line">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="field-label !mb-0 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-primary" />
                  Module Permissions ({selectedPermissions.length} selected)
                </span>
                <span className="text-[11px] text-ink-muted">
                  Choose which dashboard resources this administrator can access.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  type="text"
                  onClick={selectAllPermissions}
                  className="text-xs font-semibold text-primary hover:bg-primary/8 h-7 px-2"
                >
                  Select All
                </Button>
                <span className="text-line text-xs">|</span>
                <Button
                  size="small"
                  type="text"
                  onClick={clearAllPermissions}
                  className="text-xs text-ink-muted hover:text-ink h-7 px-2"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Permission Check Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1 py-1">
              {SYSTEM_PERMISSIONS.map((perm) => {
                const isChecked = selectedPermissions.some(
                  (p) => p.toLowerCase() === perm.key.toLowerCase()
                );
                return (
                  <div
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className={cn(
                      'flex items-start gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-150',
                      isChecked
                        ? 'border-primary/40 bg-primary/8 text-ink shadow-2xs'
                        : 'border-line bg-surface-raised text-ink-muted hover:border-line-strong hover:text-ink'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 text-xs border transition-colors',
                        isChecked
                          ? 'bg-primary border-primary text-white'
                          : 'border-line-strong bg-white'
                      )}
                    >
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight truncate">
                        {perm.key}
                      </div>
                      <div className="text-[10.5px] text-ink-faint truncate leading-normal">
                        {perm.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom permission tag adder */}
            <div className="mt-3 pt-3 border-t border-line/60 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-ink-faint shrink-0">
                Custom Tag:
              </span>
              <Input
                size="small"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onPressEnter={(e) => {
                  e.preventDefault();
                  handleAddCustomPermission();
                }}
                placeholder="e.g. Audit, Invoices"
                className="input-base !h-8 text-xs max-w-[200px]"
              />
              <Button
                size="small"
                icon={<Plus size={12} />}
                onClick={handleAddCustomPermission}
                disabled={!customTagInput.trim()}
                className="h-8 text-xs"
              >
                Add
              </Button>

              {/* Show any custom permissions that aren't in SYSTEM_PERMISSIONS */}
              <div className="flex flex-wrap gap-1 ml-auto">
                {selectedPermissions
                  .filter(
                    (p) =>
                      !SYSTEM_PERMISSIONS.some(
                        (sp) => sp.key.toLowerCase() === p.toLowerCase()
                      )
                  )
                  .map((custom) => (
                    <Tag
                      key={custom}
                      closable
                      onClose={() => togglePermission(custom)}
                      className="text-[11px] bg-primary/10 text-primary border-primary/20 m-0"
                    >
                      {custom}
                    </Tag>
                  ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <Button
              size="large"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl h-11 px-5 font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="rounded-xl h-11 px-6 font-bold shadow-md shadow-primary/20"
            >
              {isEditing ? 'Save Changes' : 'Create Admin'}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
