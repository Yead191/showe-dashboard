import { ShieldCheck, Flag, AlertTriangle } from 'lucide-react';
import { PageHeader, Panel, EmptyState, StatCard } from '@/components/ui';

export default function AdminModerationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Moderation"
        description="Review reported content across the platform."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
        <StatCard label="Open reports" value="0" icon={Flag} accent="amber" />
        <StatCard label="Resolved this week" value="12" icon={ShieldCheck} accent="success" />
        <StatCard label="Escalated" value="0" icon={AlertTriangle} accent="info" />
        <StatCard label="Avg resolution" value="2h 12m" icon={ShieldCheck} accent="primary" />
      </div>

      <Panel padded={false}>
        <EmptyState
          icon={ShieldCheck}
          title="Nothing to moderate right now"
          description="Reports of inappropriate content from end users will appear here for review. Programme builder content moderation will arrive with the workshop launch."
        />
      </Panel>
    </>
  );
}
