import { Tabs, Switch, Button } from 'antd';
import { Bell, Shield, ScrollText, KeyRound, Smartphone, MailCheck } from 'lucide-react';
import { PageHeader, Panel, Avatar } from '@/components/ui';
import { mockAuditLog } from '@/constants/mock-data';
import { timeAgo } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Account" title="Settings" description="Manage notifications, security and view your venue activity log." />

      <Tabs
        items={[
          { key: 'notifications', label: 'Notifications', children: <NotificationsTab /> },
          { key: 'security', label: 'Security', children: <SecurityTab /> },
          { key: 'team', label: 'Team', children: <TeamTab /> },
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

      <Panel title="Two-factor authentication" description="An extra layer of security on your account.">
        <div className="flex items-start gap-4 py-3">
          <span className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
            <Shield size={15} />
          </span>
          <div className="flex-1">
            <div className="font-semibold text-ink">Authenticator app</div>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Use an app like 1Password or Authy to generate codes.
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-start gap-4 py-3 border-t border-line">
          <span className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center">
            <Smartphone size={15} />
          </span>
          <div className="flex-1">
            <div className="font-semibold text-ink">SMS codes</div>
            <p className="text-[13px] text-ink-muted mt-0.5">
              Codes sent to <span className="text-ink">+44 ••• ••• 1212</span>.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </Panel>
    </div>
  );
}

function TeamTab() {
  return (
    <Panel
      title="Team members"
      description="Invite collaborators to manage events and programmes."
      action={<Button type="primary">Invite member</Button>}
    >
      <ul className="divide-y divide-line -m-1">
        {[
          { name: 'Mara Sinclair', role: 'Owner', email: 'mara@royalcrescent.co.uk' },
          { name: 'Hugo Penn', role: 'Editor', email: 'hugo@royalcrescent.co.uk' },
        ].map((m) => (
          <li key={m.email} className="flex items-center gap-3 p-3">
            <Avatar name={m.name} size={36} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink">{m.name}</div>
              <div className="text-[12.5px] text-ink-faint">{m.email}</div>
            </div>
            <span className="chip chip-primary">{m.role}</span>
            {m.role !== 'Owner' && <Button type="text">Remove</Button>}
          </li>
        ))}
      </ul>
    </Panel>
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
