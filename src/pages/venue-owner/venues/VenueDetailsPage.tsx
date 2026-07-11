import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Dropdown, Spin } from 'antd';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  MoreHorizontal,
  Palette,
  Pencil,
  Phone,
  Sparkles,
} from 'lucide-react';
import { PageHeader, Panel, TierBadge, StatusBadge, EmptyState } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import {
  mapApiVenueToVenue,
  useGetOrganizationVenuesQuery,
} from '@/store/api/organizationApi/venueApi';
import { TIER_META } from '@/constants/tiers';
import { formatDate } from '@/lib/utils';
import { VenueFormModal } from '@/features/venues/VenueFormModal';
import { VenueStatsGrid } from '@/features/venues/VenueStatsGrid';
import { VenueMapEmbed } from '@/features/venues/VenueMapEmbed';
import { getImageUrl } from '@/helpers/getImageUrl';

export default function VenueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setActiveVenueId = useAuthStore((s) => s.setActiveVenueId);
  const [editOpen, setEditOpen] = useState(false);
  const { data, isLoading } = useGetOrganizationVenuesQuery({ page: 1, limit: 50 });

  const venue = useMemo(() => {
    const match = (data?.venues ?? []).find((v) => v._id === id);
    return match ? mapApiVenueToVenue(match) : null;
  }, [id, data?.venues]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!venue) {
    return (
      <Panel padded={false}>
        <EmptyState
          icon={Building2}
          title="Venue not found"
          description="We couldn't find a venue with that id. It may have been archived or removed."
          action={
            <Link to="/owner/venues">
              <Button type="primary">Back to venues</Button>
            </Link>
          }
        />
      </Panel>
    );
  }

  const tier = TIER_META[venue.tier];
  const fullAddress = [
    venue.address_line1,
    venue.address_line2,
    venue.city,
    venue.state,
    venue.zip_code,
    venue.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <button
        onClick={() => navigate('/owner/venues')}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Back to venues
      </button>

      <PageHeader
        eyebrow="Venue"
        title={venue.name}
        description={venue.description}
        actions={
          <>
            <Dropdown
              menu={{
                items: [
                  { key: 'switch', label: 'Set as active venue' },
                  { key: 'website', label: 'Open website', disabled: !venue.website },
                  { type: 'divider' },
                  { key: 'archive', label: 'Archive', danger: true },
                ],
                onClick: ({ key }) => {
                  if (key === 'switch') {
                    setActiveVenueId(venue.id);
                    toast.success(`Switched to ${venue.name}`);
                  } else if (key === 'website' && venue.website) {
                    window.open(venue.website, '_blank');
                  }
                },
              }}
              trigger={['click']}
            >
              <Button icon={<MoreHorizontal size={15} />} />
            </Dropdown>
            <Button type="primary" icon={<Pencil size={14} />} onClick={() => setEditOpen(true)}>
              Edit venue
            </Button>
          </>
        }
      />

      {/* Hero / cover */}
      <div className="relative rounded-2xl overflow-hidden border border-line shadow-soft mb-6">
        <div className="relative h-56 md:h-72">
          <img
            src={getImageUrl(venue.cover_image)}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <TierBadge tier={venue.tier} showFull />
            <StatusBadge status={venue.status} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-ink-inverse">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-white/85 text-sm mb-1">
                <MapPin size={13} />
                <span className="truncate">{fullAddress}</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl md:text-3xl drop-shadow leading-tight">
                {venue.name}
              </h2>
            </div>
            {venue.logo && (
              <img
                src={getImageUrl(venue.logo)}
                alt=""
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white/90 object-cover shadow-medium"
              />
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <VenueStatsGrid venue={venue} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — details */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="About this venue">
            {venue.description ? (
              <p className="text-[15px] text-ink leading-relaxed">{venue.description}</p>
            ) : (
              <p className="text-sm text-ink-muted italic">No description yet.</p>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-line">
              <DetailRow icon={Sparkles} label="Tier">
                <span className="font-semibold text-ink">{tier.label}</span>
                <span className="text-ink-muted ml-2 text-[13px]">{tier.audience}</span>
              </DetailRow>
              <DetailRow icon={Building2} label="Slug">
                <span className="font-mono text-[13px] text-ink">/{venue.slug}</span>
              </DetailRow>
              <DetailRow icon={Palette} label="Brand colour">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-md border border-line"
                    style={{ background: venue.brand_color ?? '#014B52' }}
                  />
                  <span className="font-mono text-[13px] text-ink">
                    {venue.brand_color ?? '—'}
                  </span>
                </span>
              </DetailRow>
              <DetailRow icon={MapPin} label="Coordinates">
                {venue.coordinates ? (
                  <span className="font-mono text-[13px] text-ink">
                    {venue.coordinates.latitude.toFixed(4)},{' '}
                    {venue.coordinates.longitude.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-ink-muted text-[13px]">Not set</span>
                )}
              </DetailRow>
            </div>
          </Panel>

          <Panel title="Location" description="Map embed via Google Maps.">
            <VenueMapEmbed
              latitude={venue.coordinates?.latitude}
              longitude={venue.coordinates?.longitude}
              query={fullAddress}
              height={360}
            />
            <div className="mt-4 flex items-start gap-2 text-sm text-ink">
              <MapPin size={14} className="text-ink-faint mt-0.5 flex-shrink-0" />
              <span>{fullAddress}</span>
            </div>
          </Panel>
        </div>

        {/* Right column — contact / meta */}
        <div className="space-y-6">
          <Panel title="Contact">
            <ul className="space-y-3.5">
              <ContactRow icon={Mail} label="Email" value={venue.contact_email} href={`mailto:${venue.contact_email}`} />
              {venue.contact_phone && (
                <ContactRow
                  icon={Phone}
                  label="Phone"
                  value={venue.contact_phone}
                  href={`tel:${venue.contact_phone.replace(/\s+/g, '')}`}
                />
              )}
              {venue.website && (
                <ContactRow
                  icon={Globe}
                  label="Website"
                  value={venue.website.replace(/^https?:\/\//, '')}
                  href={venue.website}
                  external
                />
              )}
            </ul>
          </Panel>

          <Panel title="Activity">
            <dl className="space-y-3 text-sm">
              <MetaRow label="Created" value={formatDate(venue.created_at)} />
              <MetaRow label="Last updated" value={formatDate(venue.updated_at)} />
              <MetaRow label="Owner ID" value={venue.owner_id} mono />
              <MetaRow label="Venue ID" value={venue.id} mono />
            </dl>
          </Panel>
        </div>
      </div>

      <VenueFormModal
        open={editOpen}
        mode="edit"
        venue={venue}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-1.5 text-ink-faint text-[11px] uppercase tracking-wider font-bold mb-1">
        <Icon size={12} /> {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <span className="font-medium text-ink hover:text-primary transition-colors break-all">
      {value}
    </span>
  );
  return (
    <li className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-full bg-primary/8 text-primary flex items-center justify-center flex-shrink-0">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider font-bold text-ink-faint mb-0.5">
          {label}
        </div>
        {href ? (
          <a href={href} target={external ? '_blank' : undefined} rel="noreferrer">
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </li>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={mono ? 'font-mono text-[12.5px] text-ink' : 'text-ink font-medium'}>
        {value}
      </dd>
    </div>
  );
}
