export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export type AdminStatus = 'active' | 'suspended' | 'inactive' | 'delete';

export interface AdminUser {
  _id: string;
  name: string;
  role: AdminRole;
  email: string;
  image?: string | null;
  status: AdminStatus | string;
  contact?: string | null;
  location?: string | null;
  verified?: boolean;
  subscription?: string | null;
  isSuspended?: boolean;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  suspendedDays?: number | null;
  suspendedUntil?: string | null;
  stripe_account_id?: string | null;
  stripe_login_link?: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions: string[];
}

export interface UpdateAdminPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: AdminRole;
  permissions?: string[];
}

export interface GetAdminsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  role?: string;
  status?: string;
}

export interface AdminPagination {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetAdminsResponse {
  success: boolean;
  message: string;
  pagination: AdminPagination;
  data: AdminUser[];
}

export interface SingleAdminResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

/** Pre-configured available permission modules for Super Admin governance */
export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
  category: 'Platform' | 'Network' | 'Finance' | 'Content';
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'Users',
    label: 'Users Management',
    description: 'View, suspend, and manage venue owners and customer accounts',
    category: 'Network',
  },
  {
    key: 'Venues',
    label: 'Venues Management',
    description: 'Verify, inspect, and configure registered event venues',
    category: 'Network',
  },
  {
    key: 'Subscriptions',
    label: 'Subscriptions',
    description: 'Monitor active tier plans, memberships, and billing renewals',
    category: 'Finance',
  },
  {
    key: 'Payments',
    label: 'Payments & Transactions',
    description: 'Audit platform payments, fees, payouts, and customer refunds',
    category: 'Finance',
  },
  {
    key: 'Analytics',
    label: 'Analytics & Insights',
    description: 'Access top-level dashboard metrics, revenue graphs, and trends',
    category: 'Platform',
  },
  {
    key: 'Reports',
    label: 'Reports & Logs',
    description: 'Generate operational reports and download compliance data',
    category: 'Platform',
  },
  {
    key: 'Moderation',
    label: 'Content Moderation',
    description: 'Review flagged listings, programme submissions, and user reports',
    category: 'Content',
  },
  {
    key: 'Tiers',
    label: 'Tiers & Modules',
    description: 'Manage pricing tiers, module packages, and subscription limits',
    category: 'Platform',
  },
  {
    key: 'Customisation',
    label: 'Customisation & Branding',
    description: 'Customize platform themes, landing banners, and featured items',
    category: 'Content',
  },
  {
    key: 'FAQ',
    label: 'Help & FAQ',
    description: 'Create and organize customer-facing FAQ items and documentation',
    category: 'Content',
  },
  {
    key: 'Legal',
    label: 'Legal & Policies',
    description: 'Edit terms of service, privacy policy, and disclaimer disclosures',
    category: 'Platform',
  },
  {
    key: 'Settings',
    label: 'System Settings',
    description: 'Manage platform credentials, email configs, and API connections',
    category: 'Platform',
  },
];
