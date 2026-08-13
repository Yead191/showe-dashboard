import { Lock } from "lucide-react";
import { Button, Spin } from "antd";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { PageHeader, Panel } from "@/components/ui";
import {
  DEEP_LINK_SCREENS,
  type NotificationAudience,
  type NotificationPlatform,
} from "@/constants/notifications";
import { useMemo, useState } from "react";
import ComposeTab, { type NotificationProgrammeOption } from "./ComposeTab";
import ScheduleModal from "./ScheduleModal";
import type dayjs from "dayjs";
import type { DeepLinkParam } from "./DeepLinkConfig";
import {
  useSendPushNotificationMutation,
  type SendPushNotificationPayload,
} from "@/store/api/notificationApi";
import {
  mapApiEventToEventListItem,
  useGetOrganizationEventsQuery,
} from "@/store/api/organizationApi/eventApi";
import type { EventListItem } from "@/types/event";
import { useGetProfileQuery } from "@/store/api/authApi";
import { isModuleUnlocked } from "@/constants/module-blocks";
import {
  useGetProgrammeBookingCountQuery,
  useGetProgrammesQuery,
} from "@/store/api/programmesApi";
import {
  mapApiVenueToVenue,
  useGetOrganizationVenuesQuery,
} from "@/store/api/organizationApi/venueApi";
import type { Venue } from "@/types/venue";

const PUSH_NOTIFICATIONS_MODULE = 9;
// const WEB_ORIGIN = "https://showe-web.vercel.app";

function reachForPerformance(
  eventTotal: number,
  performances: { id: string }[],
  performanceId: string,
) {
  const idx = performances.findIndex((p) => p.id === performanceId);
  if (idx === -1 || performances.length === 0) return 0;
  const weights = performances.map((_, i) => 1 + ((i * 7) % 5) / 10);
  const total = weights.reduce((a, b) => a + b, 0);
  return Math.round((eventTotal * weights[idx]) / total);
}

function paramId() {
  return `dlp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function NotificationsPage() {
  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();
  const unlockedModules = profile?.subscription?.modules;
  const unlocked = isModuleUnlocked(PUSH_NOTIFICATIONS_MODULE, unlockedModules);

  const { data: eventsData } = useGetOrganizationEventsQuery(
    { page: 1, limit: 100 },
    { skip: !unlocked },
  );
  const events: EventListItem[] = useMemo(
    () => (eventsData?.events ?? []).map(mapApiEventToEventListItem),
    [eventsData?.events],
  );

  const { data: programmesData } = useGetProgrammesQuery(undefined, {
    skip: !unlocked,
  });
  const programmes: NotificationProgrammeOption[] = useMemo(
    () =>
      (programmesData ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        category: p.category,
        cover_image: p.cover_image,
        pageCount: Array.isArray(p.pages) ? p.pages.length : 0,
      })),
    [programmesData],
  );

  const { data: venuesData } = useGetOrganizationVenuesQuery(
    { page: 1, limit: 100 },
    { skip: !unlocked },
  );
  const venues: Venue[] = useMemo(
    () => (venuesData?.venues ?? []).map(mapApiVenueToVenue),
    [venuesData?.venues],
  );

  const [sendPushNotification, { isLoading: isSending }] =
    useSendPushNotificationMutation();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<NotificationAudience>("all");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<
    string | null
  >(null);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(
    null,
  );
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [programmePage, setProgrammePage] = useState<number>(1);
  const [platform, setPlatform] = useState<NotificationPlatform>("both");
  const [destinationScreen, setDestinationScreen] = useState<string | null>(
    "/events",
  );
  const [destinationParams, setDestinationParams] = useState<DeepLinkParam[]>(
    [],
  );
  const [destinationPathId, setDestinationPathId] = useState<DeepLinkParam[]>(
    [],
  );
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const { data: bookingCount = 0, isFetching: isBookingCountLoading } =
    useGetProgrammeBookingCountQuery(selectedProgrammeId ?? "", {
      skip: !unlocked || audience !== "programme" || !selectedProgrammeId,
    });

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) ?? null,
    [events, selectedEventId],
  );
  const selectedPerformance = useMemo(
    () =>
      selectedEvent?.performances.find((p) => p.id === selectedPerformanceId) ??
      null,
    [selectedEvent, selectedPerformanceId],
  );
  const selectedProgramme = useMemo(
    () => programmes.find((p) => p.id === selectedProgrammeId) ?? null,
    [programmes, selectedProgrammeId],
  );
  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === selectedVenueId) ?? null,
    [venues, selectedVenueId],
  );

  const reach = useMemo(() => {
    if (audience === "event" && selectedEvent) {
      if (selectedPerformanceId)
        return reachForPerformance(
          selectedEvent.programme_downloads,
          selectedEvent.performances,
          selectedPerformanceId,
        );
      return selectedEvent.programme_downloads;
    }
    if (audience === "programme") {
      return bookingCount;
    }
    if (audience === "venue") {
      return 0;
    }
    return events.reduce((sum, e) => sum + e.programme_downloads, 0);
  }, [audience, selectedEvent, selectedPerformanceId, events, bookingCount]);

  const performanceLabel = useMemo(() => {
    if (!selectedPerformance) return "All attendees";
    return `${selectedPerformance.date} · ${selectedPerformance.start_time}`;
  }, [selectedPerformance]);

  const reachFor = useMemo(
    () => (perfId: string) =>
      selectedEvent
        ? reachForPerformance(
            selectedEvent.programme_downloads,
            selectedEvent.performances,
            perfId,
          )
        : 0,
    [selectedEvent],
  );

  const programmeExtraPath = useMemo(() => {
    if (!selectedProgrammeId) return "";
    const page =
      Number.isFinite(programmePage) && programmePage > 0 ? programmePage : 1;
    return `/reader/${selectedProgrammeId}?page=${page}`;
  }, [selectedProgrammeId, programmePage]);

  const venueExtraPath = useMemo(() => {
    if (!selectedVenueId) return "";
    return `/${selectedVenueId}`;
  }, [selectedVenueId]);

  /* ── Handlers ── */

  function handleAudienceChange(next: NotificationAudience) {
    setAudience(next);
    if (next !== "event") {
      setSelectedEventId(null);
      setSelectedPerformanceId(null);
      setDestinationPathId([]);
    }
    if (next !== "programme") {
      setSelectedProgrammeId(null);
      setProgrammePage(1);
    }
    if (next !== "venue") {
      setSelectedVenueId(null);
    }
    if (next === "programme") {
      setDestinationScreen("/programmes");
    } else if (next === "event") {
      setDestinationScreen("/events");
    } else if (next === "venue") {
      setDestinationScreen(null);
    }
  }

  function handleEventChange(eventId: string | null) {
    setSelectedEventId(eventId);
    setSelectedPerformanceId(null);
    if (eventId) {
      setDestinationScreen("/events");
      setDestinationPathId([
        { id: "event_id_param", key: "event_id", value: eventId },
      ]);
    } else {
      setDestinationPathId([]);
    }
  }

  function handlePerformanceChange(perfId: string | null) {
    setSelectedPerformanceId(perfId);
  }

  function handleProgrammeChange(programmeId: string | null) {
    setSelectedProgrammeId(programmeId);
    setProgrammePage(1);
    if (programmeId) {
      setDestinationScreen("/programmes");
      setDestinationPathId([
        { id: "programme_id_param", key: "programme_id", value: programmeId },
      ]);
      setDestinationParams([{ id: paramId(), key: "page", value: "1" }]);
    } else {
      setDestinationPathId([]);
      setDestinationParams([]);
    }
  }

  function handleProgrammePageChange(page: number) {
    const nextPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    setProgrammePage(nextPage);
    setDestinationParams((prev) => {
      const existing = prev.find((p) => p.key === "page");
      if (existing) {
        return prev.map((p) =>
          p.key === "page" ? { ...p, value: String(nextPage) } : p,
        );
      }
      return [...prev, { id: paramId(), key: "page", value: String(nextPage) }];
    });
  }

  function handleVenueChange(venueId: string | null) {
    setSelectedVenueId(venueId);
  }

  function handleDestinationScreenChange(screen: string | null) {
    setDestinationScreen(screen);
    if (!screen) return;
    const screenDef = DEEP_LINK_SCREENS.find((s) => s.value === screen);
    const pathParamKey = screenDef?.pathParam;
    if (!pathParamKey) return;
    setDestinationPathId((prev) => {
      if (prev.some((p) => p.key === pathParamKey)) return prev;
      return [...prev, { id: paramId(), key: pathParamKey, value: "" }];
    });
  }

  function resetForm() {
    setTitle("");
    setBody("");
    setSelectedEventId(null);
    setSelectedPerformanceId(null);
    setSelectedProgrammeId(null);
    setSelectedVenueId(null);
    setProgrammePage(1);
    setAudience("all");
    setDestinationParams([]);
    setDestinationScreen("/events");
    setDestinationPathId([]);
    setPlatform("both");
  }

  function validateBeforeSend(): boolean {
    if (!title.trim() || !body.trim()) {
      toast.error("Add a title and body first.");
      return false;
    }
    if (audience === "event" && !selectedEventId) {
      toast.error("Select an event to notify.");
      return false;
    }
    if (audience === "programme" && !selectedProgrammeId) {
      toast.error("Select a programme to notify.");
      return false;
    }
    if (audience === "programme" && (!programmePage || programmePage < 1)) {
      toast.error("Choose a valid programme page number.");
      return false;
    }
    if (audience === "venue" && !selectedVenueId) {
      toast.error("Select a venue to notify.");
      return false;
    }
    return true;
  }

  function buildPayload(
    isScheduled = false,
    scheduleTime?: Date | string,
  ): SendPushNotificationPayload {
    const base: SendPushNotificationPayload = {
      target: "all_proggame_holders",
      title: title.trim(),
      message: body.trim(),
      filePath: "general",
      is_schedule_notification: isScheduled,
      ...(isScheduled && scheduleTime ? { schedule_time: scheduleTime } : {}),
    };

    if (audience === "event" && selectedEventId) {
      return {
        ...base,
        target: selectedPerformanceId
          ? "specific_performance"
          : "specific_event",
        event: selectedEventId,
        performance: selectedPerformanceId ?? "",
        // extraPath: `${WEB_ORIGIN}/events/${selectedEventId}`,
        extraPath: `/events/${selectedEventId}`,
      };
    }

    if (audience === "programme" && selectedProgrammeId) {
      return {
        ...base,
        target: "specific_programme",
        proggramme: selectedProgrammeId,
        extraPath: programmeExtraPath,
      };
    }

    if (audience === "venue" && selectedVenueId) {
      return {
        ...base,
        target: "specific_vanue",
        vanue: selectedVenueId,
        extraPath: venueExtraPath,
      };
    }

    return base;
  }

  async function handleSendNow() {
    if (!validateBeforeSend()) return;
    const payload = buildPayload(false);

    try {
      const res = await sendPushNotification(payload).unwrap();
      if (res.success) {
        toast.success(res.message || "Notification sent successfully.");
        resetForm();
      } else {
        toast.error(res.message || "Failed to send notification.");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "An error occurred while sending the notification.",
      );
    }
  }

  async function handleSchedule(date: dayjs.Dayjs) {
    if (!validateBeforeSend()) return;
    const scheduleTime = date.toDate();
    const payload = buildPayload(true, scheduleTime);

    try {
      const res = await sendPushNotification(payload).unwrap();
      if (res.success) {
        toast.success(res.message || "Notification scheduled successfully.");
        resetForm();
        setIsScheduleModalOpen(false);
      } else {
        toast.error(res.message || "Failed to schedule notification.");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "An error occurred while scheduling the notification.",
      );
    }
  }

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <>
        <PageHeader
          eyebrow="Push notifications"
          title="Reach your audience"
          description="Send push notifications to programme holders."
        />
        <Panel padded>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-[#8A5C00] flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div className="flex-1">
              <div className="eyebrow mb-2">Module 9</div>
              <h2 className="font-display font-extrabold text-2xl text-ink">
                Push notifications require Module 9
              </h2>
              <p className="mt-2 text-ink-muted max-w-xl">
                This page is only available for organisations with Module 9
                unlocked in their subscription.
                {profile?.subscription?.name ? (
                  <>
                    {" "}
                    You're currently on{" "}
                    <span className="font-semibold text-ink">
                      {profile.subscription.name}
                    </span>
                    .
                  </>
                ) : null}
              </p>
              <div className="mt-5 flex gap-2">
                <Link to="/owner/subscription">
                  <Button type="primary">View subscription</Button>
                </Link>
              </div>
            </div>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Push notifications"
        title="Reach your audience"
        description="Send targeted, actionable notifications to programme holders across app and web."
      />

      <ComposeTab
        title={title}
        body={body}
        setTitle={setTitle}
        setBody={setBody}
        audience={audience}
        onAudienceChange={handleAudienceChange}
        selectedEvent={selectedEvent}
        events={events}
        onEventChange={handleEventChange}
        selectedPerformanceId={selectedPerformanceId}
        selectedPerformance={selectedPerformance}
        onPerformanceChange={handlePerformanceChange}
        programmes={programmes}
        selectedProgramme={selectedProgramme}
        onProgrammeChange={handleProgrammeChange}
        programmePage={programmePage}
        onProgrammePageChange={handleProgrammePageChange}
        programmeExtraPath={programmeExtraPath}
        venues={venues}
        selectedVenue={selectedVenue}
        onVenueChange={handleVenueChange}
        venueExtraPath={venueExtraPath}
        isBookingCountLoading={isBookingCountLoading}
        reachFor={reachFor}
        performanceLabel={performanceLabel}
        platform={platform}
        onPlatformChange={setPlatform}
        destinationScreen={destinationScreen}
        destinationParams={destinationParams}
        onDestinationScreenChange={handleDestinationScreenChange}
        onDestinationParamsChange={setDestinationParams}
        destinationPathId={destinationPathId}
        onDestinationPathIdChange={setDestinationPathId}
        reach={reach}
        onSendNow={handleSendNow}
        onOpenScheduleModal={() => {
          if (!validateBeforeSend()) return;
          setIsScheduleModalOpen(true);
        }}
        isSending={isSending}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleSchedule}
        title={title}
        body={body}
        platform={platform}
        destinationScreen={destinationScreen}
      />
    </>
  );
}
