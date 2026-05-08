import { useState } from 'react';
import { Plus, MapPin, Calendar, Download, MoreHorizontal, ArrowUpRight, Search, Building2 } from 'lucide-react';
import { Button, Dropdown, Modal } from 'antd';
import { toast } from 'sonner';
import { PageHeader, Panel, TierBadge, StatusBadge, EmptyState } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { formatGBP, formatNumber } from '@/lib/utils';

export default function VenuesPage() {
  const venues = useAuthStore((s) => s.user?.venues) ?? [];
  const setActiveVenueId = useAuthStore((s) => s.setActiveVenueId);
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);

  const filtered = venues.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader
        eyebrow="Estate"
        title="Your venues"
        description="Switch any venue active in the top bar to scope analytics, events and programmes to that venue."
        actions={
          <Button type="primary" icon={<Plus size={15} />} onClick={() => setOpenCreate(true)}>
            Add venue
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your venues"
            className="input-base !h-10 pl-10"
          />
        </div>
        <span className="text-sm text-ink-muted ml-auto">
          {filtered.length} of {venues.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <Panel padded={false}>
          <EmptyState
            icon={Building2}
            title="No venues match"
            description="Try a different search, or add a new venue."
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger">
          {filtered.map((v) => (
            <article
              key={v.id}
              className="group relative rounded-2xl border border-line bg-surface-raised overflow-hidden shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300 ease-smooth"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={v.cover_image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <TierBadge tier={v.tier} showFull />
                </div>
                <div className="absolute top-3 right-3">
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'view', label: 'View venue page' },
                        { key: 'edit', label: 'Edit details' },
                        { key: 'switch', label: 'Set as active venue' },
                        { type: 'divider' },
                        { key: 'archive', label: 'Archive', danger: true },
                      ],
                      onClick: ({ key }) => {
                        if (key === 'switch') {
                          setActiveVenueId(v.id);
                          toast.success(`Switched to ${v.name}`);
                        }
                      },
                    }}
                    trigger={['click']}
                  >
                    <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-ink hover:bg-white transition-colors">
                      <MoreHorizontal size={15} />
                    </button>
                  </Dropdown>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div className="text-ink-inverse">
                    <h3 className="font-display font-extrabold text-lg leading-tight drop-shadow">{v.name}</h3>
                    <div className="flex items-center gap-1.5 text-[12.5px] mt-0.5 text-white/85">
                      <MapPin size={11} />
                      {v.city}, {v.country}
                    </div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-4">
                  <Stat icon={Calendar} label="Events" value={formatNumber(v.events_count)} />
                  <Stat icon={Download} label="Downloads" value={formatNumber(v.total_downloads, true)} />
                  <Stat icon={ArrowUpRight} label="Revenue" value={formatGBP(v.total_revenue, { compact: true })} />
                </div>

                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                  <div className="text-[12px] text-ink-muted">
                    {v.programmes_count} programme{v.programmes_count !== 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={() => {
                      setActiveVenueId(v.id);
                      toast.success(`Switched to ${v.name}`);
                    }}
                    className="text-[13px] font-semibold text-primary hover:text-primary-700 inline-flex items-center gap-1 hover:gap-1.5 transition-all"
                  >
                    Open <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        title="Add a new venue"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => {
                toast.success('Venue created (mock).');
                setOpenCreate(false);
              }}
            >
              Create venue
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Add a new venue under your account. Tier inherits from your subscription.
          </p>
          <div>
            <label className="field-label">Venue name</label>
            <input className="input-base" placeholder="The Lyric Gallery" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">City</label>
              <input className="input-base" placeholder="Bath" />
            </div>
            <div>
              <label className="field-label">Postcode</label>
              <input className="input-base" placeholder="BA1 2LR" />
            </div>
          </div>
          <div>
            <label className="field-label">Contact email</label>
            <input className="input-base" placeholder="hello@yourvenue.co.uk" />
          </div>
        </div>
      </Modal>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div>
      <div className="inline-flex items-center gap-1 text-ink-faint text-[11px] uppercase tracking-wider font-bold mb-1">
        <Icon size={11} /> {label}
      </div>
      <div className="font-display font-extrabold text-base text-ink tabular leading-tight">{value}</div>
    </div>
  );
}
