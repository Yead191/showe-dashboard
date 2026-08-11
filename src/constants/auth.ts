import type { AuthUser } from '@/types/auth';
import { mockVenues } from './venues';

export const mockAuthUsers: Record<string, AuthUser> = {
  venue_owner: {
    id: 'usr_owner_001',
    name: 'Mara Sinclair',
    email: 'mara@royalcrescent.co.uk',
    avatar_url: 'https://i.pravatar.cc/200?img=47',
    role: 'ORGANIZATION',
    org_type: 'venue',
    tier: 'tier_3',
    active_venue_id: null, // "all venues" default
    venues: mockVenues.filter((v) => v.owner_id === 'usr_owner_001'),
    created_at: '2024-08-12T10:30:00Z',
    last_login_at: '2026-05-08T08:14:00Z',
    is_verified: true,
  },
  super_admin: {
    id: 'usr_admin_001',
    name: 'Helena Pryce',
    email: 'helena@showe.app',
    avatar_url: 'https://i.pravatar.cc/200?img=44',
    role: 'SUPER_ADMIN',
    created_at: '2024-01-04T09:00:00Z',
    last_login_at: '2026-05-08T07:50:00Z',
    is_verified: true,
  },
};

// Demo credentials shown on login screen
// export const DEMO_CREDS = {
//   venue_owner: { email: 'mara@royalcrescent.co.uk', password: 'showedemo' },
//   super_admin: { email: 'helena@showe.app', password: 'showedemo' },
// };
// export const DEMO_CREDS = {
//   venue_owner: { email: 'ee8x3is6od@bltiid.com', password: '3433443443' },
//   super_admin: { email: 'mdjowelahmed924@gmail.com', password: 'Test@123' },
// };
export const DEMO_CREDS = {
  venue_owner: { email: '1zahqp9ke7@yzcalo.com', password: '3433443443' },
  super_admin: { email: 'superadmin@gmail.com', password: 'password@' },
};
