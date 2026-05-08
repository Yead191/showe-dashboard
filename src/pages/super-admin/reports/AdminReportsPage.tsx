import { FileBarChart2, Download, Plus, BarChart3, Users, CreditCard, Building2 } from 'lucide-react';
import { Button } from 'antd';
import { PageHeader, Panel, EmptyState } from '@/components/ui';

export default function AdminReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Reports"
        description="Build and export reports across the entire platform."
        actions={<Button type="primary" icon={<Plus size={14} />}>Build report</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7 stagger">
        {[
          { icon: BarChart3, name: 'Revenue, monthly', desc: 'Total platform revenue split by tier and venue' },
          { icon: Users, name: 'End-user growth', desc: 'New sign-ups and retention curves' },
          { icon: CreditCard, name: 'Subscription churn', desc: 'Monthly churn and reasons' },
          { icon: Building2, name: 'Venue performance', desc: 'Top and bottom performers' },
        ].map((r) => (
          <article
            key={r.name}
            className="rounded-2xl border border-line bg-surface-raised p-5 hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300 ease-smooth cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <r.icon size={16} />
            </div>
            <h3 className="font-display font-bold text-ink">{r.name}</h3>
            <p className="text-[12.5px] text-ink-muted mt-1 leading-snug">{r.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <Button type="link" style={{ padding: 0, height: 'auto' }}>Open</Button>
              <Button type="text" icon={<Download size={13} />} />
            </div>
          </article>
        ))}
      </div>

      <Panel padded={false}>
        <EmptyState
          icon={FileBarChart2}
          title="Custom reports coming soon"
          description="Build your own report — pick metrics, segments and time ranges, then export to CSV or PDF."
          action={<Button type="primary">Notify me when ready</Button>}
        />
      </Panel>
    </>
  );
}
