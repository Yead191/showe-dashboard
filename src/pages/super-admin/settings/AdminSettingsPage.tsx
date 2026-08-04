import { Tabs, Button, Input, Pagination, Empty, Spin, Modal, Form, Popconfirm } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, User, Upload, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, PageHeader, Panel } from '@/components/ui';
import { getImageUrl } from '@/helpers/getImageUrl';
import { useGetActivitiesQuery } from '@/store/api/activityApi';
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/store/api/authApi';
import {
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useGetFaqsQuery,
  useUpdateFaqMutation,
  type ApiFaq,
} from '@/store/api/faqApi';

type AdminSettingsTab = 'general' | 'audit' | 'faq';

function isAdminSettingsTab(value: string | null): value is AdminSettingsTab {
  return value === 'general' || value === 'audit' || value === 'faq';
}

function getErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err !== null && 'data' in err) {
    return (err as { data?: { message?: string } }).data?.message ?? fallback;
  }
  return fallback;
}

function formatFaqDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tabs');
  const activeTab: AdminSettingsTab = isAdminSettingsTab(tabFromUrl) ? tabFromUrl : 'general';

  useEffect(() => {
    if (isAdminSettingsTab(tabFromUrl)) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tabs', 'general');
        return next;
      },
      { replace: true }
    );
  }, [tabFromUrl, setSearchParams]);

  function setTab(nextTab: string) {
    if (!isAdminSettingsTab(nextTab)) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tabs', nextTab);
        return next;
      },
      { replace: true }
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Settings"
        description="Manage your account security and core platform configuration."
      />

      <Tabs
        activeKey={activeTab}
        onChange={setTab}
        items={[
          { key: 'general', label: 'General', children: <General /> },
          { key: 'audit', label: 'Audit log', children: <AuditTab /> },
          { key: 'faq', label: 'FAQ', children: <FAQTab /> },
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

            <div className="flex-1 grid grid-cols-1  gap-5 w-full">
              <div className="">
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
                  disabled
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

function FAQTab() {
  const { data: faqs = [], isLoading, isFetching } = useGetFaqsQuery();
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ApiFaq | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form] = Form.useForm<FaqFormValues>();

  const openCreate = () => {
    setEditingFaq(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (faq: ApiFaq) => {
    setEditingFaq(faq);
    form.setFieldsValue({
      question: faq.question,
      answer: faq.answer,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        question: values.question.trim(),
        answer: values.answer.trim(),
      };

      if (editingFaq) {
        const response = await updateFaq({ id: editingFaq._id, data: payload }).unwrap();
        toast.success(response.message || 'FAQ updated successfully.');
      } else {
        const response = await createFaq(payload).unwrap();
        toast.success(response.message || 'FAQ created successfully.');
      }

      setIsModalOpen(false);
      setEditingFaq(null);
      form.resetFields();
    } catch (err) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      toast.error(getErrorMessage(err, editingFaq ? 'Failed to update FAQ.' : 'Failed to create FAQ.'));
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await deleteFaq(id).unwrap();
      toast.success(response.message || 'FAQ deleted successfully.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete FAQ.'));
    } finally {
      setDeletingId(null);
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <>
      <Panel
        title="FAQ"
        description="Manage frequently asked questions shown across the platform."
        action={
          <Button type="primary" icon={<Plus size={14} />} onClick={openCreate} className="rounded-xl">
            Add FAQ
          </Button>
        }
      >
        {isLoading || isFetching ? (
          <div className="py-16 flex justify-center">
            <Spin />
          </div>
        ) : faqs.length === 0 ? (
          <Empty description="No FAQs yet" />
        ) : (
          <ul className="space-y-2">
            {faqs.map((faq) => (
              <li
                key={faq._id}
                className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-surface-sunken transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink">{faq.question}</div>
                  <div className="text-[13px] text-ink-muted mt-1 whitespace-pre-wrap">{faq.answer}</div>
                  <div className="text-[11px] text-ink-faint mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <span>Created {formatFaqDate(faq.createdAt)}</span>
                    <span>Updated {formatFaqDate(faq.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="text"
                    icon={<Pencil size={14} />}
                    onClick={() => openEdit(faq)}
                    aria-label="Edit FAQ"
                  />
                  <Popconfirm
                    title="Delete this FAQ?"
                    description="This action cannot be undone."
                    okText="Delete"
                    okButtonProps={{ danger: true, loading: isDeleting && deletingId === faq._id }}
                    onConfirm={() => void handleDelete(faq._id)}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={14} />}
                      loading={isDeleting && deletingId === faq._id}
                      aria-label="Delete FAQ"
                    />
                  </Popconfirm>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal
        title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}
        open={isModalOpen}
        onOk={() => void handleSubmit()}
        onCancel={() => {
          if (isSaving) return;
          setIsModalOpen(false);
          setEditingFaq(null);
          form.resetFields();
        }}
        okText={editingFaq ? 'Save changes' : 'Create FAQ'}
        okButtonProps={{ loading: isSaving }}
        cancelButtonProps={{ disabled: isSaving }}
        closable={!isSaving}
        maskClosable={!isSaving}
        destroyOnClose
        centered
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="question"
            label="Question"
            rules={[
              { required: true, message: 'Question is required.' },
              { whitespace: true, message: 'Question is required.' },
            ]}
          >
            <Input placeholder="Enter question" className="rounded-xl" />
          </Form.Item>
          <Form.Item
            name="answer"
            label="Answer"
            rules={[
              { required: true, message: 'Answer is required.' },
              { whitespace: true, message: 'Answer is required.' },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Write your answer here" className="rounded-xl" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

type FaqFormValues = {
  question: string;
  answer: string;
};
