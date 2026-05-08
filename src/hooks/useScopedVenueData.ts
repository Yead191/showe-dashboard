import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { mockEvents } from '@/constants/events';
import { mockProgrammes, mockRefundRequests } from '@/constants/mock-data';

/**
 * Returns data scoped to the currently active venue.
 * If no active venue is selected (null), returns aggregate across all owner's venues.
 */
export function useScopedVenueData() {
  const user = useAuthStore((s) => s.user);
  const activeId = user?.active_venue_id ?? null;
  const venues = user?.venues ?? [];
  const venueIds = venues.map((v) => v.id);

  return useMemo(() => {
    const activeVenue = activeId ? venues.find((v) => v.id === activeId) ?? null : null;
    const scopedVenueIds = activeId ? [activeId] : venueIds;

    const events = mockEvents.filter((e) => scopedVenueIds.includes(e.venue_id));
    const programmes = mockProgrammes.filter((p) => scopedVenueIds.includes(p.venue_id));
    const refunds = mockRefundRequests.filter((r) => scopedVenueIds.includes(r.venue_id));

    const totals = {
      revenue: programmes.reduce((s, p) => s + p.revenue, 0),
      downloads: programmes.reduce((s, p) => s + p.downloads, 0),
      events: events.length,
      programmes: programmes.length,
      pending_refunds: refunds.filter((r) => r.status === 'pending').length,
    };

    return {
      activeVenue,
      isAggregate: !activeId,
      venues: activeId ? venues.filter((v) => v.id === activeId) : venues,
      events,
      programmes,
      refunds,
      totals,
    };
  }, [activeId, venues, venueIds]);
}
