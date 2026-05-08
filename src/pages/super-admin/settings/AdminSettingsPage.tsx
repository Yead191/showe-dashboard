import { Tabs, Button, Input } from 'antd';
import { Avatar, PageHeader, Panel } from '@/components/ui';
import { mockAuditLog } from '@/constants';
import { timeAgo } from '@/lib/utils';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 ">
      <Panel title="Platform">
        <div className="space-y-4">
          <div>
            <label className="field-label">Platform name</label>
            <input className="input-base" defaultValue="SHOWE" />
          </div>
          <div>
            <label className="field-label">Support email</label>
            <input className="input-base" defaultValue="support@showe.app" />
          </div>
          <div>
            <label className="field-label">Currency</label>
            <input className="input-base" defaultValue="GBP (en-GB)" disabled />
          </div>
          <div className="pt-2">
            <Button type="primary" block className="h-11 rounded-xl font-bold">
              Save configuration
            </Button>
          </div>
        </div>
      </Panel>

      <Panel
        title="Change password"
        description="Regularly updating your password ensures account security."
      // icon={<Lock size={16} />}
      >
        <div className="flex flex-col h-full gap-4">
          <div>
            <label className="field-label">Current password</label>
            <Input.Password
              className="input-base"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">New password</label>
              <Input.Password
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="field-label">Confirm new password</label>
              <Input.Password
                className="input-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mt-auto pt-2">
            <Button
              type="primary"
              block
              className="h-11 rounded-xl font-bold bg-primary border-none text-ink"
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
  return (
    <Panel title="Platform audit log" description="Every admin action is logged here.">
      <ul className="space-y-1">
        {mockAuditLog.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-surface-sunken transition-colors"
          >
            <Avatar name={a.actor_name} size={32} />
            <div className="flex-1">
              <div className="text-sm">
                <span className="font-semibold text-ink">{a.actor_name}</span>{' '}
                <span className="text-ink-muted">{a.action.replace('.', ' · ')}</span>{' '}
                <span className="font-semibold text-ink">{a.target_label}</span>
              </div>
              <div className="text-[12px] text-ink-faint mt-0.5">{timeAgo(a.created_at)}</div>
            </div>
            <span className="chip">{a.target_type}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}