import { useState } from 'react';
import { Tabs, Button, Modal } from 'antd';
import { Utensils, Hotel, Wine, MapPin, Plus, Star, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
import { MOCK_RECOMMENDATION } from '@/constants/mock-recommendation';

type TabKey = 'restaurants' | 'hotels' | 'bars';

export default function PlanTripPage() {
  const [tab, setTab] = useState<TabKey>('restaurants');
  const [openAdd, setOpenAdd] = useState(false);

  const TABS = [
    { key: 'restaurants', label: 'Restaurants', icon: Utensils, items: MOCK_RECOMMENDATION?.nearby_restaurants ?? [] },
    { key: 'hotels', label: 'Hotels', icon: Hotel, items: MOCK_RECOMMENDATION?.nearby_hotels ?? [] },
    { key: 'bars', label: 'Bars', icon: Wine, items: MOCK_RECOMMENDATION?.nearby_bars ?? [] },
  ] as const;

  const active = TABS.find((t) => t.key === tab)!;

  return (
    <>
      <PageHeader
        eyebrow="Recommendations"
        title="Plan your trip"
        description="Curate places near your venue. These appear in Module 8 of your programmes and on event pages."
        actions={
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setOpenAdd(true)}>
            Add recommendation
          </Button>
        }
      />

      <Panel padded={false}>
        <div className="px-5 pt-4 border-b border-line">
          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as TabKey)}
            items={TABS.map((t) => ({
              key: t.key,
              label: (
                <span className="inline-flex items-center gap-1.5">
                  <t.icon size={13} />
                  {t.label}
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-bold text-ink-muted">
                    {t.items.length}
                  </span>
                </span>
              ),
            }))}
          />
        </div>

        {active.items.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={`No ${active.label.toLowerCase()} yet`}
            description="Add nearby spots to recommend to programme holders."
            action={
              <Button type="primary" onClick={() => setOpenAdd(true)}>
                Add first recommendation
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {active.items.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-4 hover:bg-surface-sunken transition-colors">
                <img src={p.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-surface-sunken" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{p.name}</span>
                    <span className="chip">{p.category}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[12.5px] text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <Star size={11} className="text-accent fill-accent" />
                      <span className="text-ink font-semibold tabular">{p.rating}</span>
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} /> {p.distance}
                    </span>
                    <span>·</span>
                    <span>{p.price}</span>
                  </div>
                </div>
                <Button type="text" icon={<MoreHorizontal size={15} />} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        title={`Add ${active.label.slice(0, -1).toLowerCase()}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => {
                toast.success('Recommendation added.');
                setOpenAdd(false);
              }}
            >
              Add
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="field-label">Name</label>
            <input className="input-base" placeholder={active.key === 'restaurants' ? 'The Gilded Fork' : 'Grand Horizon Hotel'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Type</label>
              <input className="input-base" placeholder={active.key === 'restaurants' ? 'Fine dining' : 'Boutique'} />
            </div>
            <div>
              <label className="field-label">Distance</label>
              <input className="input-base" placeholder="0.4 mi" />
            </div>
          </div>
          <div>
            <label className="field-label">Image URL</label>
            <input className="input-base" placeholder="https://..." />
          </div>
        </div>
      </Modal>
    </>
  );
}
