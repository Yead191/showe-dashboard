/* Programme — shape kept minimal since builder is later */
export type ProgrammeStatus = 'draft' | 'published' | 'archived';

export interface Programme {
  id: string;
  venue_id: string;
  event_id: string;
  title: string;
  cover_image: string;
  status: ProgrammeStatus;
  price_pence: number; // 0 = free, else >= 200
  is_free: boolean;
  pages_count: number;
  downloads: number;
  revenue: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

/* Refund */
export type RefundStatus = 'pending' | 'approved' | 'declined' | 'auto_escalated' | 'resolved_by_admin';
export type RefundReason =
  | 'event_cancelled'
  | 'duplicate_purchase'
  | 'technical_issue'
  | 'changed_mind'
  | 'not_as_described'
  | 'other';

export interface RefundRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  programme_id: string;
  programme_title: string;
  venue_id: string;
  venue_name: string;
  amount_pence: number;
  reason: RefundReason;
  reason_note?: string;
  status: RefundStatus;
  requested_at: string;
  responded_at?: string;
  responded_by?: string;
  response_note?: string;
  // 7 day window — auto-escalates if not actioned
  escalate_at: string;
}

/* Subscription */
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';
export type BillingInterval = 'monthly' | 'annual';

export interface Subscription {
  id: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  tier: 'tier_1' | 'tier_1_plus' | 'tier_2' | 'tier_3' | 'tier_3_plus';
  interval: BillingInterval;
  status: SubscriptionStatus;
  amount_pence: number;
  current_period_start: string;
  current_period_end: string;
  next_billing_at: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

/* Analytics — for charts */
export interface MetricPoint {
  date: string; // "Mon", "Tue" etc, or ISO
  value: number;
}

export interface AnalyticsSnapshot {
  views: number;
  views_delta: number; // pct
  dwell_seconds: number;
  dwell_delta: number;
  clicks: number;
  clicks_delta: number;
  downloads: number;
  downloads_delta: number;
}

/* End user (event-goer) */
export interface EndUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  city?: string;
  programmes_owned: number;
  total_spent: number; // GBP
  refund_requests: number;
  device_count: number;
  status: 'active' | 'suspended' | 'deleted';
  joined_at: string;
  last_active_at: string;
}

/* Notifications (in-dashboard bell) */
export type NotificationType =
  | 'programme_purchase'
  | 'refund_request'
  | 'subscription_renewal'
  | 'payment_failed'
  | 'venue_invite'
  | 'system_alert'
  | 'event_published';

export interface DashboardNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  meta?: Record<string, unknown>;
}

/* Audit log */
export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string; // e.g. "programme.published", "venue.suspended"
  target_type: string;
  target_id: string;
  target_label: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/* Payment / transaction */
export type TxnType = 'programme_purchase' | 'subscription' | 'refund' | 'payout';
export type TxnStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  type: TxnType;
  status: TxnStatus;
  amount_pence: number;
  fee_pence: number; // 10% commission for SHOWE on programme purchases
  net_pence: number;
  currency: 'GBP';
  description: string;
  user_id?: string;
  user_name?: string;
  venue_id?: string;
  venue_name?: string;
  programme_id?: string;
  created_at: string;
}
