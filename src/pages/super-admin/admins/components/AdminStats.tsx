import { Shield, ShieldAlert, UserCheck, Users } from 'lucide-react';
import { StatCard } from '@/components/ui';
import type { AdminUser } from '@/types/admin';

interface AdminStatsProps {
  admins: AdminUser[];
  totalFromApi?: number;
}

export function AdminStats({ admins, totalFromApi }: AdminStatsProps) {
  const total = totalFromApi ?? admins.length;
  const superAdmins = admins.filter((a) => a.role === 'SUPER_ADMIN').length;
  const regularAdmins = admins.filter((a) => a.role === 'ADMIN').length;
  const activeCount = admins.filter(
    (a) => !a.isSuspended && (a.status === 'active' || !a.status)
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Admins"
        value={String(total)}
        hint="Registered administrators"
        icon={Users}
        accent="primary"
      />
      <StatCard
        label="Super Admins"
        value={String(superAdmins)}
        hint="Unrestricted platform access"
        icon={ShieldAlert}
        accent="amber"
      />
      <StatCard
        label="Standard Admins"
        value={String(regularAdmins)}
        hint="Role-delegated operators"
        icon={Shield}
        accent="info"
      />
      <StatCard
        label="Active Accounts"
        value={String(activeCount)}
        hint="Operational & unsuspended"
        icon={UserCheck}
        accent="success"
      />
    </div>
  );
}
