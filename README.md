# SHOWE Dashboard

A premium dashboard for SHOWE — the digital event programme platform for the UK theatre community. Built with React, TypeScript, Tailwind CSS, and a curated touch of Ant Design.

## What's inside

**Two roles, two complete experiences:**

- **Organisation** — manage venues, events, programmes, refunds, analytics, subscription tier, push notifications, sponsor slots, and curated nearby recommendations.
- **Super Admin** — oversee the entire platform: venues, users, subscriptions, payments, refund escalations, reports, customisation, and audit logs.

**Stack**
- React 19 + TypeScript + Vite
- Tailwind CSS for the entire visual system
- Ant Design only for **Tables, Buttons, Tabs, Modals, Dropdowns** (themed to match the brand)
- Recharts for visualisations
- Sonner for toasts
- Zustand (with persistence) for auth and UI state
- React Router v7

## Get started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Demo credentials

Use the role tabs on the login screen, then either type these in or click "Fill in":

| Role          | Email                              | Password   |
| ------------- | ---------------------------------- | ---------- |
| Venue Owner   | `mara@royalcrescent.co.uk`         | `showedemo`|
| Super Admin   | `helena@showe.app`                 | `showedemo`|

## Folder structure

```
src/
├── components/
│   ├── ui/           Logo, Avatar, Panel, StatCard, TierBadge, StatusBadge, PageHeader, EmptyState, SectionTitle
│   ├── layout/       Sidebar, TopBar, VenueSwitcher, NotificationBell, UserMenu, MobileNav
│   ├── charts/       TrendChart, BarsChart, DonutChart, ChartTooltip
│   └── feedback/     (reserved)
├── constants/        All mock data — venues, owners, events, programmes, refunds, subscriptions, transactions, notifications, audit log, analytics
├── features/
│   └── events/       EventFormDrawer (full event form with tabs)
├── hooks/            useScopedVenueData (active venue scoping)
├── layouts/          AuthLayout, DashboardLayout
├── lib/              utils (formatters), antd-theme
├── pages/
│   ├── auth/         Login, ForgotPassword, VerifyOtp, ResetPassword
│   ├── venue-owner/  Overview, Venues, Events, Programmes, Refunds, Analytics, Subscription, Profile, Settings, Notifications, Adverts, PlanTrip
│   └── super-admin/  Overview, Venues, Users, Subscriptions, Refunds, Payments, Analytics, Reports, Moderation, Customisation, Settings
├── routes/           Router config + ProtectedRoute / PublicOnlyRoute guards
├── store/            auth.store.ts
├── styles/           Global styles, AntD overrides, animations
└── types/            All domain types
```

## Design system

- **Primary** `#014B52` (deep teal) — focused, considered
- **Accent** `#F5A800` (warm amber) — CTAs, active states, sparkle
- **Surfaces** warm cream palette (`#F6F4EF` / `#FBFAF7` / `#F2EFE9`) — editorial feel
- **Typography** — Satoshi (body) paired with Cabinet Grotesk (display headings)
- **Tabular numerals** on all stats
- **Soft shadows + generous whitespace + 1.5rem default radii**
- **Light only** — no dark mode toggle as specified

## Locked decisions

- Two roles only (Super Admin, Venue Owner). No separate sub-admin role.
- Login = manual role toggle (Venue Owner / Admin tabs).
- Registration is on the marketing site, not the dashboard.
- One owner can have multiple venues. "All venues" aggregate view is the default.
- One subscription tier applies to all the owner's venues.
- One QR code per event (not per performance).
- Programme builder is a "coming soon" page until you finalise the spec.
- Programme prices editable post-publish; refunds handled by venue owner with 7-day window before auto-escalation to admin.
- Currency: GBP only (`en-GB` locale).
- All data is in `src/constants/` as you requested.

## Notes

- Programme workshop / builder is intentionally a "coming soon" page per your direction. The scaffolding is in place to drop the workshop in when ready.
- Tier-gated features (advanced analytics, push notifications, adverts) show clear upgrade panels for users on lower tiers.
- Refund escalation logic is mocked: each request has an `escalate_at` timestamp 7 days after `requested_at`. Pending refunds within 1 day of escalation show in red.

Built with care. Open to extending — the design tokens and components are reusable across whatever you build next.
