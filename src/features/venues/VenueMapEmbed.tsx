import { ExternalLink, MapPin } from 'lucide-react';

interface VenueMapEmbedProps {
  latitude?: number;
  longitude?: number;
  query?: string;
  height?: number;
}

export function VenueMapEmbed({
  latitude,
  longitude,
  query,
  height = 320,
}: VenueMapEmbedProps) {
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';

  if (!hasCoords && !query) {
    return (
      <div
        className="rounded-xl border border-dashed border-line bg-surface-sunken flex items-center justify-center text-ink-muted text-sm"
        style={{ height }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          No coordinates available
        </div>
      </div>
    );
  }

  // Coordinates take precedence — Google's keyless `q=lat,lng` embed.
  const mapQuery = hasCoords
    ? `${latitude},${longitude}`
    : encodeURIComponent(query ?? '');
  const src = `https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`;
  const externalUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <div className="relative rounded-xl overflow-hidden border border-line bg-surface-sunken">
      <iframe
        title="Venue location map"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ width: '100%', height, border: 0 }}
        allowFullScreen
      />
      <a
        href={externalUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur text-[12px] font-semibold text-ink hover:bg-white shadow-sm transition-colors"
      >
        <ExternalLink size={12} /> Open in Maps
      </a>
    </div>
  );
}
