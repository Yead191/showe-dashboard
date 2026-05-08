import { Tabs, Button, Switch } from 'antd';
import { Key, Webhook, Mail, Shield, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, Avatar } from '@/components/ui';
import { mockAuditLog } from '@/constants/mock-data';
import { timeAgo } from '@/lib/utils';

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Settings"
        description="Integrations, API keys, security and platform-wide audit log."
      />

      <Tabs
        items={[
          { key: 'general', label: 'General', children: <General /> },
          { key: 'api', label: 'API & webhooks', children: <ApiPanel /> },
          { key: 'security', label: 'Security', children: <SecurityPanel /> },
          { key: 'audit', label: 'Audit log', children: <AuditTab /> },
        ]}
      />
    </>
  );
}

function General() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
        </div>
      </Panel>

      <Panel title="Refund policy">
        <div className="space-y-4">
          <div>
            <label className="field-label">Venue response window (days)</label>
            <input className="input-base" defaultValue="7" />
            <p className="text-[12px] text-ink-faint mt-1.5">After this, refunds auto-escalate to admin.</p>
          </div>
          <div>
            <label className="field-label">Auto-approve admin escalations</label>
            <div className="h-11 flex items-center">
              <Switch />
              <span className="ml-2 text-sm text-ink-muted">Off — admin reviews each one</span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function ApiPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Panel title="API keys" description="Used for server-to-server integration." action={<Button type="primary">New key</Button>}>
        <ul className="space-y-2.5 -m-1">
          {[
            { name: 'Production', key: 'sk_live_••••••••••••••• 2f4a', last: '2026-05-08T07:00:00Z' },
            { name: 'Staging', key: 'sk_test_••••••••••••••• 9e1b', last: '2026-05-04T11:00:00Z' },
          ].map((k) => (
            <li key={k.name} className="flex items-center gap-3 p-3 rounded-lg bg-surface-sunken">
              <Key size={14} className="text-ink-muted" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-ink">{k.name}</div>
                <div className="text-[12.5px] text-ink-faint font-mono">{k.key}</div>
                <div className="text-[11px] text-ink-faint mt-0.5">Last used {timeAgo(k.last)}</div>
              </div>
              <Button
                type="text"
                icon={<Copy size={13} />}
                onClick={() => toast.success('Key copied to clipboard.')}
              />
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Webhooks" action={<Button type="primary">Add endpoint</Button>}>
        <ul className="space-y-2.5">
          {[
            { url: 'https://hooks.showe.app/payments', events: 6, status: 'Active' },
            { url: 'https://hooks.showe.app/refunds', events: 3, status: 'Active' },
          ].map((w) => (
            <li key={w.url} className="flex items-center gap-3 p-3 rounded-lg bg-surface-sunken">
              <Webhook size={14} className="text-ink-muted" />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[12.5px] text-ink truncate">{w.url}</div>
                <div className="text-[11px] text-ink-faint">{w.events} events</div>
              </div>
              <span className="chip chip-success">{w.status}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Panel title="Admin sessions" description="Active sessions on this admin account.">
        <ul className="space-y-2">
          <li className="flex items-center gap-3 p-3 rounded-lg bg-surface-sunken">
            <Shield size={14} className="text-success" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-ink">Mac · Chrome</div>
              <div className="text-[12.5px] text-ink-faint">London, UK · current session</div>
            </div>
            <span className="chip chip-success">Active</span>
          </li>
        </ul>
      </Panel>
      <Panel title="Email security alerts">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={14} className="text-ink-muted" />
            <div className="flex-1">
              <div className="font-semibold text-sm text-ink">New admin sign-in</div>
              <div className="text-[12.5px] text-ink-faint">Email me when an admin signs in from a new device.</div>
            </div>
            <Switch defaultChecked />
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
