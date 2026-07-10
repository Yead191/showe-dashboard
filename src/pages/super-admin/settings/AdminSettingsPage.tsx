import { Tabs, Button, Input, Pagination, Empty, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, User, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, PageHeader, Panel } from '@/components/ui';
import { getImageUrl } from '@/helpers/getImageUrl';
import { useGetActivitiesQuery } from '@/store/api/activityApi';
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/store/api/authApi';

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Settings"
        description="Manage your account security and core platform configuration."
      />

      <Tabs
        items={[
          { key: 'general', label: 'General', children: <General /> },
          { key: 'audit', label: 'Audit log', children: <AuditTab /> },
        ]}
      />
    </>
  );
}

function General() {
  const { data: profile, isLoading, isFetching } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setContact(profile.contact ?? '');
      setEmail(profile.email ?? '');
    }
  }, [profile]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const resolvedProfileImage = profile?.image?.trim();
  const displayImage =
    imagePreview ?? (resolvedProfileImage ? getImageUrl(resolvedProfileImage) : undefined);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    const nextName = name.trim() || profile?.name?.trim() || '';
    const nextEmail = email.trim() || profile?.email?.trim() || '';

    if (!nextName) {
      toast.error('Name is required.');
      return;
    }

    if (!nextEmail) {
      toast.error('Email is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    try {
      const response = await updateProfile({
        name: nextName,
        email: nextEmail,
        contact: contact.trim() || undefined,
        image: imageFile ?? undefined,
      }).unwrap();

      toast.success(response.message || 'Profile updated successfully.');
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to update profile.')
          : 'Failed to update profile.';
      toast.error(errorMessage);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }).unwrap();

      toast.success(response.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMessage =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Failed to change password.')
          : 'Failed to change password.';
      toast.error(errorMessage);
    }
  };

  const isProfileLoading = isLoading && !profile;

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-stretch">
      <Panel
        title="Profile"
        description="Update your account details and profile image."
        className="flex-1 min-w-0 flex flex-col"
      >
        {isProfileLoading ? (
          <div className="py-16 flex justify-center">
            <Spin />
          </div>
        ) : (
          <form
            className="flex flex-col md:flex-row gap-8 items-start"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSaveProfile();
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar
                  key={displayImage ?? 'profile-avatar'}
                  src={displayImage}
                  name={name || profile?.name || 'Admin'}
                  size={100}
                  ring
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity flex items-center justify-center text-xs font-bold"
                >
                  Change
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <Button
                icon={<Upload size={14} />}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl"
              >
                Upload image
              </Button>
              {imageFile && (
                <span className="text-[12px] text-ink-faint truncate max-w-[160px]">{imageFile.name}</span>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              <div className="md:col-span-2">
                <label className="field-label">Full name</label>
                <Input
                  size="large"
                  prefix={<User size={14} className="text-ink-faint mr-1" />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="field-label">Email address</label>
                <Input
                  size="large"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  prefix={<Mail size={14} className="text-ink-faint mr-1" />}
                  value={email}
                  className="h-11 rounded-xl"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="field-label">Phone number</label>
                <Input
                  size="large"
                  prefix={<Phone size={14} className="text-ink-faint mr-1" />}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+44 ..."
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </form>
        )}

        <div className="mt-auto pt-6 flex justify-end">
          <Button
            type="primary"
            htmlType="button"
            size="large"
            loading={isUpdating || isFetching}
            disabled={isProfileLoading || isUpdating}
            onClick={() => void handleSaveProfile()}
            className="rounded-xl px-8 h-12"
          >
            Save profile
          </Button>
        </div>
      </Panel>

      <Panel
        title="Change password"
        description="Regularly updating your password ensures account security."
        className="flex-1 min-w-0 flex flex-col"
      >
        <div className="flex flex-col flex-1 gap-4">
          <div>
            <label className="field-label">Current password</label>
            <Input.Password
              className="input-base"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">New password</label>
            <Input.Password
              className="input-base"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Confirm new password</label>
            <Input.Password
              className="input-base"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="mt-auto pt-2">
            <Button
              type="primary"
              loading={isChangingPassword}
              onClick={handleChangePassword}
              className="h-11 rounded-xl font-bold bg-primary border-none text-ink px-8"
            >
              Update password
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function AuditTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching } = useGetActivitiesQuery({ page, limit: pageSize });
  const activities = data?.activities ?? [];

  return (
    <Panel title="Platform audit log" description="Every admin action is logged here.">
      {isLoading || isFetching ? (
        <div className="py-16 flex justify-center">
          <Spin />
        </div>
      ) : activities.length === 0 ? (
        <Empty description="No activity yet" />
      ) : (
        <>
          <ul className="space-y-1">
            {activities.map((activity) => (
              <li
                key={activity._id}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-surface-sunken transition-colors"
              >
                <Avatar name={activity.title} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{activity.title}</div>
                  <div className="text-[12px] text-ink-faint mt-0.5 truncate">{activity.description}</div>
                </div>
                <span className="chip">{activity.type}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-end mt-4">
            <Pagination
              current={data?.pagination.page ?? page}
              pageSize={data?.pagination.limit ?? pageSize}
              total={data?.pagination.total ?? 0}
              showSizeChanger
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          </div>
        </>
      )}
    </Panel>
  );
}
