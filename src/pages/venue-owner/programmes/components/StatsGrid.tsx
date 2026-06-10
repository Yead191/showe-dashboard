import { memo } from 'react';
import { BookOpen, Sparkles, Eye, MousePointerClick } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { formatGBP, formatNumber } from '@/lib/utils';

interface StatsGridProps {
    totalCount: number;
    publishedCount: number;
    downloads: number;
    revenue: number;
}

export const StatsGrid = memo(function StatsGrid({
    totalCount,
    publishedCount,
    downloads,
    revenue,
}: StatsGridProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger mb-7">
            <StatCard label="Programmes" value={String(totalCount)} icon={BookOpen} accent="primary" />
            <StatCard label="Published" value={String(publishedCount)} icon={Sparkles} accent="success" />
            <StatCard label="Lifetime downloads" value={formatNumber(downloads)} icon={Eye} accent="info" />
            <StatCard
                label="Revenue"
                value={formatGBP(revenue, { compact: true })}
                icon={MousePointerClick}
                accent="amber"
            />
        </div>
    );
});