export type UserRole = 'SUPER_ADMIN' | 'ORGANIZATION';

export type VenueTier = 'tier_1' | 'tier_1_plus' | 'tier_2' | 'tier_3' | 'tier_3_plus';

export type OrgType = 'school' | 'venue' | 'producer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  // Venue owner specific
  org_type?: OrgType;
  tier?: VenueTier;
  active_venue_id?: string | null; // null = "all venues" view
  venues?: Venue[];
  // Common
  created_at: string;
  last_login_at?: string;
  is_verified: boolean;
}

import type { Venue } from './venue';
