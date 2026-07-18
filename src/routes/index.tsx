import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Auth
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Venue Owner pages
import VenueOwnerOverview from '@/pages/venue-owner/overview/OverviewPage';
import VenueOwnerVenues from '@/pages/venue-owner/venues/VenuesPage';
import VenueOwnerVenueDetails from '@/pages/venue-owner/venues/VenueDetailsPage';
import VenueOwnerEvents from '@/pages/venue-owner/events/EventsPage';
import VenueOwnerProgrammes from '@/pages/venue-owner/programmes/ProgrammesPage';
import VenueOwnerRefunds from '@/pages/venue-owner/refunds/RefundsPage';
import VenueOwnerAnalytics from '@/pages/venue-owner/analytics/AnalyticsPage';
import VenueOwnerSubscription from '@/pages/venue-owner/subscription/SubscriptionPage';
import VenueOwnerSettings from '@/pages/venue-owner/settings/SettingsPage';
import VenueOwnerNotifications from '@/pages/venue-owner/notifications/NotificationsPage';
import VenueOwnerPromotions from '@/pages/venue-owner/promotions/PromotionsPage';
import VenueOwnerPlanTrip from '@/pages/venue-owner/plan-trip/PlanTripPage';
import VenueOwnerArtists from '@/pages/venue-owner/artists/ArtistsPage';

// Super Admin pages
import AdminOverview from '@/pages/super-admin/overview/AdminOverviewPage';
import AdminVenues from '@/pages/super-admin/venues/AdminVenuesPage';
import AdminUsers from '@/pages/super-admin/users/AdminUsersPage';
import AdminSubscriptions from '@/pages/super-admin/subscriptions/AdminSubscriptionsPage';
import AdminPayments from '@/pages/super-admin/payments/AdminPaymentsPage';
import AdminAnalytics from '@/pages/super-admin/analytics/AdminAnalyticsPage';
import AdminReports from '@/pages/super-admin/reports/AdminReportsPage';
import AdminModeration from '@/pages/super-admin/moderation/AdminModerationPage';
import AdminCustomisation from '@/pages/super-admin/customisation/AdminCustomisationPage';
import AdminSettings from '@/pages/super-admin/settings/AdminSettingsPage';

import { ProtectedRoute, PublicOnlyRoute } from './guards';
import { useAuthStore } from '@/store/auth.store';
import AdminTiers from '@/pages/super-admin/tiers/AdminTiers';
import ReaderPage from '@/features/programmes/reader/ReaderPage';
import ProgrammeBuilderPage from '@/pages/venue-owner/programmes/BuilderPage';

function RootRedirect() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'super_admin' ? '/admin' : '/owner'} replace />;
}

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },

  // Auth
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  { path: '/verify-otp', element: <VerifyOtpPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // Reader page — public, no auth required
  { path: '/reader/:id', element: <ReaderPage /> },

  // Programme builder — full-screen, NO DashboardLayout
  {
    path: '/owner/programmes/:id/edit',
    element: (
      <ProtectedRoute role="venue_owner">
        <ProgrammeBuilderPage />
      </ProtectedRoute>
    ),
  },

  // Venue owner
  {
    path: '/owner',
    element: (
      <ProtectedRoute role="venue_owner">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <VenueOwnerOverview /> },
      { path: 'venues', element: <VenueOwnerVenues /> },
      { path: 'venues/:id', element: <VenueOwnerVenueDetails /> },
      { path: 'events', element: <VenueOwnerEvents /> },
      { path: 'programmes', element: <VenueOwnerProgrammes /> },
      { path: 'refunds', element: <VenueOwnerRefunds /> },
      { path: 'analytics', element: <VenueOwnerAnalytics /> },
      { path: 'subscription', element: <VenueOwnerSubscription /> },
      // { path: 'profile', element: <VenueOwnerProfile /> },
      { path: 'settings', element: <VenueOwnerSettings /> },
      { path: 'notifications', element: <VenueOwnerNotifications /> },
      { path: 'promotions', element: <VenueOwnerPromotions /> },
      { path: 'recommendations', element: <VenueOwnerPlanTrip /> },
      { path: 'artists', element: <VenueOwnerArtists /> },
    ],
  },

  // Super admin
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="super_admin">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'venues', element: <AdminVenues /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'subscriptions', element: <AdminSubscriptions /> },
      // { path: 'refunds', element: <AdminRefunds /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'reports', element: <AdminReports /> },
      { path: 'moderation', element: <AdminModeration /> },
      { path: 'customisation', element: <AdminCustomisation /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: 'tiers', element: <AdminTiers /> },
      // Aliases for sidebar links that don't have full pages yet
      // { path: 'search-prominence', element: <AdminCustomisation /> },
    ],
  },

  { path: '*', element: <RootRedirect /> },
]);
