import { memo } from "react";
import { BookOpen, Sparkles, Eye, MousePointerClick } from "lucide-react";
import { StatCard } from "@/components/ui";
import { formatGBP, formatNumber } from "@/lib/utils";

interface StatsGridProps {
  totalCount: number;
  publishedCount: number;
  downloads: number;
  revenue: number;
  isLoading?: boolean;
}

export const StatsGrid = memo(function StatsGrid({
  totalCount,
  publishedCount,
  downloads,
  revenue,
  isLoading = false,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger mb-7">
      <StatCard
        label="Programmes"
        value={isLoading ? "—" : String(totalCount)}
        icon={BookOpen}
        accent="primary"
      />
      <StatCard
        label="Published"
        value={isLoading ? "—" : String(publishedCount)}
        icon={Sparkles}
        accent="success"
      />
      <StatCard
        label="Total downloads"
        value={isLoading ? "—" : formatNumber(downloads)}
        icon={Eye}
        accent="info"
      />
      <StatCard
        label="Revenue"
        value={isLoading ? "—" : formatGBP(revenue, { compact: true })}
        icon={MousePointerClick}
        accent="amber"
      />
    </div>
  );
});
