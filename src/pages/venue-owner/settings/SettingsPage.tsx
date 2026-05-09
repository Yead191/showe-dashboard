import { Tabs, Switch, Button } from 'antd';
import { Bell, ScrollText, KeyRound, MailCheck } from 'lucide-react';
import { PageHeader, Panel } from '@/components/ui';
import { mockAuditLog } from '@/constants/mock-data';
import { timeAgo } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" description="Manage notifications, security and view your venue activity log." />

      <Tabs
        items={[
          { key: 'security', label: 'Security', children: <SecurityTab /> },
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Panel title="Password" description="Change your password regularly.">
        <div className="space-y-4">
          <div>
            <label className="field-label">Current password</label>
            <input type="password" className="input-base" placeholder="••••••••" />
          </div>
          <div>
            <label className="field-label">New password</label>
            <input type="password" className="input-base" placeholder="••••••••" />
          </div>
          <Button type="primary" icon={<KeyRound size={13} />}>
            Update password
          </Button>
        </div>
      </Panel>

    </div>
  );
}


function AuditTab() {
  return (
    <Panel
      title="Activity log"
      description="A record of changes made to your venues, events and programmes."
    >
      <ul className="space-y-1">
        {mockAuditLog.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-surface-sunken transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-surface-sunken text-ink-muted flex items-center justify-center shrink-0">
              <ScrollText size={14} />
            </span>
            <div className="flex-1">
              <div className="text-sm">
                <span className="font-semibold text-ink">{a.actor_name}</span>{' '}
                <span className="text-ink-muted">{a.action.replace('.', ' · ')}</span>
              </div>
              <div className="text-[12px] text-ink-faint">
                {a.target_label} · {timeAgo(a.created_at)}
              </div>
            </div>
            <span className="chip">{a.target_type}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
