import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, MoreHorizontal, Pencil, Copy, Trash2, Archive, ExternalLink, QrCode } from 'lucide-react';
import { Dropdown } from 'antd';
import { Panel, StatusBadge } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import MediaRenderer from '@/helpers/MediaRenderer';
import { QrModal } from './QrModal';
import type { ProgrammeDoc } from '@/types/programme';

interface ProgrammeCardProps {
    programme: ProgrammeDoc;
    venueLabel?: string;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onArchive: (id: string) => void;
}

function findCoverImage(p: ProgrammeDoc): string | undefined {
    for (const page of p.pages) {
        for (const block of page.blocks) {
            if (block.type === 'hero' && block.cover_image) return block.cover_image;
            if (block.type === 'image_story' && block.image) return block.image;
            if (block.type === 'cast_spotlight' && block.image) return block.image;
        }
    }
    return undefined;
}

export const ProgrammeCard = memo(function ProgrammeCard({
    programme,
    venueLabel,
    onDelete,
    onDuplicate,
    onArchive,
}: ProgrammeCardProps) {
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const totalBlocks = programme.pages.reduce((s, pg) => s + pg.blocks.length, 0);
    const cover = programme.cover_image ?? findCoverImage(programme);

    return (
        <>
            <Panel className="!p-0 overflow-hidden group">
                <Link to={`/owner/programmes/${programme.id}/edit`} className="block">
                    <div className="relative aspect-[16/9] bg-surface-sunken overflow-hidden">
                        {cover ? (
                            <MediaRenderer
                                src={cover}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-ink-faint">
                                <BookOpen size={28} />
                            </div>
                        )}
                        <div className="absolute top-2 left-2">
                            <StatusBadge status={programme.status} />
                        </div>
                    </div>
                </Link>
                <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <Link to={`/owner/programmes/${programme.id}/edit`} className="min-w-0 flex-1 group/link">
                            <div className="flex items-center gap-2 mb-1.5">
                                {programme.category && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                        {programme.category}
                                    </span>
                                )}
                                {programme.price_pence > 0 ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 flex items-center gap-0.5">
                                        £{(programme.price_pence / 100).toFixed(2).replace(/\.00$/, '')}
                                    </span>
                                ) : programme.is_free && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-surface-sunken border border-line text-ink-muted">
                                        Free
                                    </span>
                                )}
                            </div>
                            <div className="font-display font-bold text-[15px] text-ink leading-tight truncate group-hover/link:text-primary transition-colors">
                                {programme.title}
                            </div>
                            <div className="text-[11.5px] text-ink-faint mt-1">
                                {programme.pages.length} page{programme.pages.length !== 1 ? 's' : ''} · {totalBlocks} block{totalBlocks !== 1 ? 's' : ''}
                                {venueLabel && (
                                    <>
                                        {' · '}
                                        <span className="text-ink-muted font-medium">{venueLabel}</span>
                                    </>
                                )}
                            </div>
                        </Link>
                        <Dropdown
                            trigger={['click']}
                            menu={{
                                items: [
                                    {
                                        key: 'edit',
                                        icon: <Pencil size={12} />,
                                        label: <Link to={`/owner/programmes/${programme.id}/edit`}>Edit</Link>,
                                    },
                                    {
                                        key: 'reader',
                                        icon: <ExternalLink size={12} />,
                                        label: 'Open reader',
                                        onClick: () => window.open(`/reader/${programme.id}`, '_blank'),
                                    },
                                    {
                                        key: 'view_qr',
                                        icon: <QrCode size={12} />,
                                        label: 'View QR code',
                                        onClick: () => setIsQRModalOpen(true),
                                    },
                                    {
                                        key: 'duplicate',
                                        icon: <Copy size={12} />,
                                        label: 'Duplicate',
                                        onClick: () => onDuplicate(programme.id),
                                    },
                                    { type: 'divider' },
                                    {
                                        key: 'archive',
                                        icon: <Archive size={12} />,
                                        label: programme.status === 'archived' ? 'Already archived' : 'Archive',
                                        disabled: programme.status === 'archived',
                                        onClick: () => onArchive(programme.id),
                                    },
                                    {
                                        key: 'delete',
                                        icon: <Trash2 size={12} />,
                                        label: 'Delete',
                                        danger: true,
                                        onClick: () => onDelete(programme.id),
                                    },
                                ],
                            }}
                        >
                            <button className="w-7 h-7 rounded-md text-ink-faint hover:text-ink hover:bg-surface-sunken flex items-center justify-center shrink-0">
                                <MoreHorizontal size={14} />
                            </button>
                        </Dropdown>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 text-[11.5px] text-ink-faint">
                        <span className="inline-flex items-center gap-1">
                            <Clock size={11} /> Updated {timeAgo(programme.updated_at)}
                        </span>
                        <Link
                            to={`/owner/programmes/${programme.id}/edit`}
                            className="font-semibold text-primary hover:text-primary-700 transition-colors"
                        >
                            Edit →
                        </Link>
                    </div>
                </div>
            </Panel>

            <QrModal
                open={isQRModalOpen}
                onCancel={() => setIsQRModalOpen(false)}
                programmeId={programme.id}
                programmeTitle={programme.title}
            />
        </>
    );
});