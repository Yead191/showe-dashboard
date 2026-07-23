import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Table, Dropdown, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Mic2,
  Plus,
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Panel, EmptyState, DeleteConfirmModal } from '@/components/ui';
import { getImageUrl } from '@/helpers/getImageUrl';
import {
  useDeleteArtistMutation,
  useGetAllArtistsQuery,
  type ApiArtist,
} from '@/store/api/organizationApi/artistApi';
import { getApiErrorMessage } from '@/lib/api-error';
import { ArtistFormModal } from './ArtistFormModal';

const SEARCH_DEBOUNCE_MS = 300;

export default function ArtistsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiArtist | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ApiArtist | null>(null);

  useEffect(() => {
    setSearchInput(searchFromUrl);
    setDebouncedSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = searchInput.trim();
          if (trimmed) next.set('search', trimmed);
          else next.delete('search');
          return next;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      searchTerm: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );

  const { data, isLoading, isError, isFetching } = useGetAllArtistsQuery(queryParams);
  const [deleteArtist, { isLoading: isDeleting }] = useDeleteArtistMutation();

  const artists = data?.artists ?? [];

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(artist: ApiArtist) {
    setEditing(artist);
    setFormOpen(true);
  }

  function requestDelete(artist: ApiArtist) {
    setPendingDelete(artist);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      const result = await deleteArtist(pendingDelete._id).unwrap();
      toast.success(result.message || `"${pendingDelete.name}" deleted.`);
      setDeleteOpen(false);
      setPendingDelete(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete artist.'));
    }
  }

  const columns: ColumnsType<ApiArtist> = [
    {
      title: 'Artist',
      key: 'artist',
      width: '28%',
      render: (_, record) => {
        const imageSrc = record.image ? getImageUrl(record.image) : '';
        return (
          <div className="flex items-center gap-3 min-w-0">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                className="w-12 h-12 rounded-lg object-cover bg-surface-sunken shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-surface-sunken shrink-0" />
            )}
            <div className="min-w-0">
              <div className="font-semibold text-ink truncate">{record.name}</div>
              <div className="text-[12.5px] text-ink-faint truncate">
                {record.category || record.origin || '—'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '16%',
      render: (v?: string) => (v ? <span className="chip">{v}</span> : '—'),
    },
    {
      title: 'Genres',
      dataIndex: 'genres',
      key: 'genres',
      width: '22%',
      ellipsis: true,
      render: (v?: string[]) => (
        <span className="text-sm text-ink-muted">{v?.length ? v.join(', ') : '—'}</span>
      ),
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
      key: 'origin',
      width: '16%',
      render: (v?: string) => <span className="text-sm text-ink-muted">{v || '—'}</span>,
    },
    {
      title: 'Since',
      dataIndex: 'career_start_year',
      key: 'career_start_year',
      width: '10%',
      render: (v?: number) => (
        <span className="text-sm text-ink-muted tabular">{v ?? '—'}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: '8%',
      align: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <Pencil size={13} />, label: 'Edit' },
              { type: 'divider' },
              { key: 'delete', icon: <Trash2 size={13} />, label: 'Delete', danger: true },
            ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === 'edit') openEdit(record);
              if (key === 'delete') requestDelete(record);
            },
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<MoreHorizontal size={15} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Programming"
        title="Artists"
        description="Manage artists for your organisation. Link them to events and programmes."
        actions={
          <Button type="primary" icon={<Plus size={14} />} onClick={openAdd}>
            Add artist
          </Button>
        }
      />

      <Panel padded={false} className="overflow-hidden">
        <div className="px-5 py-4 flex flex-wrap items-center gap-3 border-b border-line">
          <div className="relative max-w-xs w-full ml-auto">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search artists"
              className="input-base !h-10 pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={Mic2}
            title="Couldn’t load artists"
            description="Something went wrong fetching your artists. Please try again."
          />
        ) : artists.length === 0 && !debouncedSearch.trim() ? (
          <EmptyState
            icon={Mic2}
            title="No artists yet"
            description="Add artists to feature them on your events."
            action={
              <Button type="primary" icon={<Plus size={14} />} onClick={openAdd}>
                Add first artist
              </Button>
            }
          />
        ) : artists.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matches"
            description={`No artists match "${debouncedSearch}".`}
          />
        ) : (
          <Table
            rowKey="_id"
            dataSource={artists}
            columns={columns}
            loading={isFetching}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            tableLayout="fixed"
            rowClassName="cursor-pointer"
            onRow={(record) => ({
              onClick: () => openEdit(record),
            })}
          />
        )}
      </Panel>

      <ArtistFormModal
        open={formOpen}
        editing={editing}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onCancel={() => {
          setDeleteOpen(false);
          setPendingDelete(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
        loading={isDeleting}
        title="Delete artist?"
        description="This will permanently remove the artist from your organisation."
        targetName={pendingDelete?.name}
      />
    </>
  );
}
