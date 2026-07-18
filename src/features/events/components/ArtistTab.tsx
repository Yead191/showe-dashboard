import { Select, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { Mic2 } from 'lucide-react';
import { FieldGroup } from './FieldGroup';
import { getImageUrl } from '@/helpers/getImageUrl';
import { useGetAllArtistsQuery } from '@/store/api/organizationApi/artistApi';
import type { EventFormState } from '../types';

interface ArtistTabProps {
  state: EventFormState;
  update: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void;
}

export function ArtistTab({ state, update }: ArtistTabProps) {
  const { data, isLoading } = useGetAllArtistsQuery({ page: 1, limit: 100 });
  const artists = data?.artists ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spin />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
          <Mic2 size={16} />
          Featured artist
        </h3>
        <p className="text-[12.5px] text-ink-muted mt-1 leading-relaxed">
          Select an artist from your organisation. Their profile will appear on the event page.
        </p>
      </div>

      <FieldGroup label="Artist" required hint="Choose from artists you have already added.">
        {artists.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-line rounded-2xl bg-surface-sunken/30">
            <p className="text-sm text-ink-muted">No artists found.</p>
            <p className="text-[12px] text-ink-faint mt-1">
              Add artists first in the{' '}
              <Link to="/owner/artists" className="text-primary font-semibold hover:underline">
                Artists
              </Link>{' '}
              page.
            </p>
          </div>
        ) : (
          <Select
            showSearch
            allowClear
            className="w-full premium-select"
            placeholder="Select an artist"
            value={state.artist_id ?? undefined}
            optionFilterProp="label"
            onChange={(value) => {
              const next = value == null ? null : String(value);
              update('artist_id', next);
            }}
            options={artists.map((artist) => ({
              value: String(artist._id),
              label: artist.name,
              artist,
            }))}
            optionRender={(option) => {
              const artist = option.data.artist;
              const imageSrc = artist?.image ? getImageUrl(artist.image) : '';
              return (
                <div className="flex items-center gap-2.5 py-0.5">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover bg-surface-sunken shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface-sunken shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-medium">{artist?.name}</div>
                    {(artist?.type || artist?.category) && (
                      <div className="text-[11px] text-ink-faint truncate">
                        {[artist?.type, artist?.category].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          />
        )}
      </FieldGroup>
    </div>
  );
}
