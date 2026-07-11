import { useState } from 'react';
import { Tabs, Switch, Button, Input, Spin, Empty, Pagination } from 'antd';
import { Bell, ScrollText, KeyRound, MailCheck, User, Mail, Phone } from 'lucide-react';
import { PageHeader, Panel, Avatar } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { useGetOrganizationActivitiesQuery } from '@/store/api/organizationApi/activitiesApi';

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" description="Manage notifications, security and view your venue activity log." />

      <Tabs
        defaultActiveKey="security"
        items={[
          { key: 'security', label: 'Security & Profile', children: <SecurityTab /> },
          { key: 'notifications', label: 'Notifications', children: <NotificationsTab /> },
          { key: 'audit', label: 'Activity log', children: <AuditTab /> },
        ]}
      />
    </>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  defaultChecked = true,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <li className="flex items-start gap-4 py-4 border-b border-line last:border-0">
      <span className="w-10 h-10 rounded-full bg-surface-sunken text-ink-muted flex items-center justify-center shrink-0">
        <Icon size={15} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink">{title}</div>
        <p className="text-[13px] text-ink-muted mt-0.5">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </li>
  );
}

function NotificationsTab() {
  return (
    <Panel title="Email notifications">
      <ul>
        <ToggleRow icon={Bell} title="New programme purchase" description="When a customer buys one of your programmes." />
        <ToggleRow icon={MailCheck} title="Refund requests" description="When a customer requests a refund." />
        <ToggleRow icon={MailCheck} title="Subscription renewals" description="Reminder 7 days before your subscription renews." />
        <ToggleRow
          icon={MailCheck}
          title="Weekly digest"
          description="Summary of activity across your venues, sent every Monday."
          defaultChecked={false}
        />
      </ul>
    </Panel>
  );
}

function SecurityTab() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel
          className="lg:col-span-2"
          title="Owner profile"
          description="Your personal information used for account management and billing."
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <Avatar src={user?.avatar_url} name={user?.name ?? ''} size={100} ring />
              <button className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity flex items-center justify-center text-xs font-bold">
                Change
              </button>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              <div className="md:col-span-2">
                <label className="field-label">Full name</label>
                <Input size="large" prefix={<User size={14} className="text-ink-faint mr-1" />} defaultValue={user?.name} className="h-11 rounded-xl" />
              </div>
              <div>
                <label className="field-label">Email address</label>
                <Input disabled size="large" prefix={<Mail size={14} className="text-ink-faint mr-1" />} defaultValue={user?.email} className="h-11 rounded-xl" />
              </div>
              <div>
                <label className="field-label">Phone number</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  onWheel={(e) => e.currentTarget.blur()}
                  pattern="[0-9]*"
                  size="large"
                  prefix={<Phone size={14} className="text-ink-faint mr-1" />}
                  placeholder="+44 ..."
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-line flex justify-end">
            <Button type="primary" size="large" className="rounded-xl px-8 h-12">Save profile</Button>
          </div>
        </Panel>

        <Panel title="Password" description="Secure your account with a strong password.">
          <div className="space-y-4">
            <div>
              <label className="field-label">Current password</label>
              <Input.Password className="h-11 rounded-xl" placeholder="••••••••" />
            </div>
            <div>
              <label className="field-label">New password</label>
              <Input.Password className="h-11 rounded-xl" placeholder="••••••••" />
            </div>
            <div className="pt-2">
              <Button type="primary" block icon={<KeyRound size={14} />} className="h-11 rounded-xl">
                Update password
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function AuditTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, isError } = useGetOrganizationActivitiesQuery({
    page,
    limit: pageSize,
  });
  const activities = data?.activities ?? [];

  return (
    <Panel
      title="Activity log"
      description="A record of changes made to your venues, events and programmes."
    >
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Spin />
        </div>
      ) : isError ? (
        <Empty description="Couldn’t load activity. Please try again." />
      ) : activities.length === 0 ? (
        <Empty description="No activity yet" />
      ) : (
        <>
          <ul className={`space-y-1 ${isFetching ? 'opacity-70' : ''}`}>
            {activities.map((activity) => (
              <li
                key={activity._id}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-surface-sunken transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-surface-sunken text-ink-muted flex items-center justify-center shrink-0">
                  <ScrollText size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{activity.title}</div>
                  <div className="text-[12px] text-ink-faint mt-0.5 truncate">
                    {activity.description}
                  </div>
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
