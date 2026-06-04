# SHOWE Dashboard

A premium management dashboard for **SHOWE** — the digital event programme platform for the UK theatre and arts community. Venue owners build interactive digital programmes, manage events/venues, and engage audiences. Super admins oversee the entire platform.

Built with React 19, TypeScript 6, Tailwind CSS, and Ant Design.

---

## Roles

| Role | Description |
|---|---|
| **Organisation (Venue Owner)** | Manage venues, events, digital programmes, refunds, analytics, subscription/tier, push notifications, sponsor ads, and nearby recommendations. |
| **Super Admin** | Oversee venues, users, subscriptions, payments, refund escalations, reports, platform customisation, tier/module management, and audit logs. |

---

## Features

### Programme Builder

The centrepiece of SHOWE. A full drag-and-drop builder with:

- **10 modules** — Foundation, People & Credits, Context & Notes, Interactive Reactions, Purchasing, Memory Capture, Highlight & Recap, Recommendations, Push Notifications, Getting There
- **24 block types** — hero, welcome, schedule, cast grid, narrative text, polls, merch listings, donation forms, maps, and more
- **Live Preview** — real-time WYSIWYG preview of the programme as you build
- **Live Inspector** — click any block to edit its properties (colours, layout, animations, content)
- **Modules Library** — sidebar palette to browse modules and drag blocks onto pages
- **Multi-page support** — add, reorder, rename, and delete pages
- **Animation system** — per-block entrance animations (fade, slide, scale, flip)
- **IndexedDB persistence** — programmes survive browser refreshes via `zustand` + IndexedDB
- **Public reader** — published programmes are viewable at `/reader/:id` by anyone, no login required

### Venue Management

- Create, edit, archive, and delete venues
- Venue details with stats, map embed, and performance metrics
- Venue switcher in the top bar — scope the entire dashboard to a single venue or "All Venues"

### Event Management

- Full CRUD with a 7-tab form drawer: Basics, Media, Schedule, Venue, Host, Recommendations, Programmes
- Status filtering: all / published / draft / archived / cancelled

### Refund Management

- Inbox with approve/decline workflow
- 7-day auto-escalation to super admin
- Status tabs: pending / auto-escalated / approved / declined

### Push Notifications

- Compose with deep-link targets (events, programmes, venues)
- Audience targeting by event, venue, or performance
- Platform selection: app, web, or both
- Schedule for later delivery
- Sent history with open/click rates

### Promotions & Ads (Tier 2+)

- Create and manage sponsored ad slots
- Impressions, clicks, and revenue stats

### Subscriptions & Tier System

| Tier | Price | Venues | Programmes | Modules |
|---|---|---|---|---|
| **1 — Foundation** | Free | 1 | 5 | 1–4 |
| **1+ — Presence** | £40/mo | 2 | 10 | 1–4, 10 |
| **2 — Engage** | £75/mo | 5 | 50 | 1–8, 10 |
| **3 — Amplify** | £150/mo | 20 | Unlimited | 1–10 |
| **3+ — Producers** | £200/mo | Unlimited | Unlimited | 1–10 + commission sales |

- Add-on products: Sponsored Listings (£25/mo), Push Notifications (£25/mo), Advanced Data Export (£15/mo)
- Tier gating throughout the UI — locked features show upgrade prompts

### Plan Trip / Recommendations

- Curated nearby places — restaurants, hotels, bars — tied to venues for programme recommendation blocks

### Super Admin Tools

- **Platform overview** — MRR, venue/user counts, commission KPIs, revenue trends, tier mix, platform health alerts
- **Venue management** — search/filter venue owners, suspend/unsuspend, tier overrides, detail drawer with audit trail
- **User management** — end-user table, detail drawer, suspend/delete
- **Subscription management** — all subscriptions, MRR metrics, tier changes, cancellations (immediate / end-of-period / with refund), invoices
- **Payments** — transaction table with filters (programme / subscription / refund / payout), CSV export, gross/fees/net totals
- **Tiers & Modules** — manage tier definitions and module assignments
- **Customisation** — platform-level branding and settings
- **Moderation, Reports, Analytics** — placeholder pages ready for backend integration

---

## Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 19.2.5 |
| **Language** | TypeScript 6.0 |
| **Build Tool** | Vite 8 |
| **Routing** | React Router DOM v7 |
| **State Management** | Zustand v5 (localStorage + IndexedDB persistence) |
| **UI Components** | Ant Design v5 (Tables, Buttons, Tabs, Modals, Dropdowns — themed) |
| **CSS** | Tailwind CSS v3.4 + PostCSS |
| **Charts** | Recharts v2.15 |
| **Icons** | Lucide React v0.469 |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Toasts** | Sonner v1.7 |
| **Date Handling** | DayJS v1.11 |
| **Deployment** | Vercel (SPA rewrites) |

---

## Getting Started

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

---

## Demo Credentials

Use the role tabs on the login screen:

| Role | Email | Password |
|---|---|---|
| **Venue Owner** | `mara@royalcrescent.co.uk` | `showedemo` |
| **Super Admin** | `helena@showe.app` | `showedemo` |

---

## Folder Structure

```
src/
├── components/
│   ├── ui/           Logo, Avatar, Panel, StatCard, PageHeader, EmptyState, StatusBadge, TierBadge, SectionTitle, DeleteConfirmModal
│   ├── layout/       Sidebar, TopBar, VenueSwitcher, NotificationBell, UserMenu, MobileNav
│   ├── charts/       TrendChart, BarsChart, DonutChart, ChartTooltip, colors
│   └── subscription/ UpgradeTierModal, AddOnCard, AddOnPurchaseModal
├── constants/        All mock data — venues, owners, events, programmes, refunds, subscriptions, transactions, notifications, tiers, addons, module blocks, audit log, analytics, recommendations
├── features/
│   ├── events/       EventFormDrawer (7-tab form)
│   ├── venues/       VenueCard, VenueFormModal, VenueFormFields
│   ├── programmes/
│   │   ├── builder/  BuilderDndContext, LivePreview, LiveInspector, ModulesLibrary, BlockPreviews
│   │   ├── reader/   ReaderPage (public programme viewer)
│   │   └── store/    programmes.store.ts (Zustand + IndexedDB)
│   ├── promotions/   AdModal, AdListItem, PromotionsStats
│   └── subscriptions/ CancelSubscriptionModal, ChangeTierModal, InvoicesModal, ViewCustomerModal
├── hooks/            useScopedVenueData (active venue scoping)
├── helpers/          MediaRenderer
├── layouts/          AuthLayout, DashboardLayout
├── lib/              utils (GBP formatters), antd-theme, access (tier/module gating), storage (IndexedDB wrapper)
├── pages/
│   ├── auth/         Login, ForgotPassword, VerifyOtp, ResetPassword
│   ├── venue-owner/  Overview, Venues (list + details), Events, Programmes (list + builder), Refunds, Analytics, Subscription, Notifications, Promotions, PlanTrip, Profile, Settings
│   └── super-admin/  Overview, Venues, Users, Subscriptions, Payments, Analytics, Reports, Moderation, Customisation, Settings, Tiers
├── routes/           createBrowserRouter config + ProtectedRoute/PublicOnlyRoute guards
├── store/            auth.store.ts (Zustand + localStorage)
├── styles/           index.css (Tailwind + AntD overrides + animations), print.css
└── types/            auth.ts, event.ts, venue.ts, programme.ts (discriminated unions), index.ts
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| **Primary** | `#014B52` (deep teal) | Headers, nav, primary buttons |
| **Accent** | `#F5A800` (warm amber) | CTAs, active states, highlights |
| **Surfaces** | `#F6F4EF` / `#FBFAF7` / `#F2EFE9` | Warm cream editorial feel |
| **Body font** | Satoshi | UI text, labels |
| **Display font** | Cabinet Grotesk | Headings, large titles |
| **Radii** | `1.5rem` default | Cards, panels, modals |
| **Mode** | Light only | No dark mode |

---

## Architecture Notes

- **No real backend** — all data is mocked in `src/constants/`. The architecture is ready for API integration behind the store/context layer.
- **Persistence** — auth state in `localStorage`, programme documents in `IndexedDB` via zustand middleware.
- **Venue scoping** — the `useScopedVenueData` hook filters all data by the active venue selected in the top bar.
- **Tier gating** — `src/lib/access.ts` provides `getEffectiveModules()`, `hasCapability()`, and `isAddOnAvailable()` to conditionally render features based on the owner's subscription tier.
- **Route guards** — `ProtectedRoute` checks authentication and role; `PublicOnlyRoute` redirects authenticated users to their dashboard.
- **Locale** — UK English (`en-GB`), GBP currency only.
