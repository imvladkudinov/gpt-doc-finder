import { useEffect, useMemo, useState } from "react";
import { IconBellFilled, IconClockFilled } from "@tabler/icons-react";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import GlassBackButton from "@/components/GlassBackButton";
import { ListCell } from "@/components/ui/ListCell";
import { ensurePushSubscription, disablePushSubscription } from "@/lib/device-notifications";
import { appToast } from "@/lib/app-toast";
import { supabase } from "@/integrations/supabase/client";

const SLOT_LOCAL_HOURS = {
  Morning: 9,
  Day: 14,
  Evening: 20,
} as const;

const localHourToUtc = (localHour: number): number => {
  const offsetMinutes = new Date().getTimezoneOffset();
  return ((localHour + Math.round(offsetMinutes / 60)) % 24 + 24) % 24;
};

const SLOT_OPTIONS = [
  { value: "Morning", label: "Morning (09:00)" },
  { value: "Day", label: "Day (14:00)" },
  { value: "Evening", label: "Evening (20:00)" },
] as const;

type NotificationSlot = keyof typeof SLOT_LOCAL_HOURS;

const toFriendlyNotificationError = (raw: string) => {
  const normalized = raw.toLowerCase();

  if (normalized.includes("permission")) return "Please allow notifications";
  if (normalized.includes("secure context") || normalized.includes("unsupported")) return "Push is unavailable";
  if (normalized.includes("sign in") || normalized.includes("jwt") || normalized.includes("401")) return "Please sign in";
  if (normalized.includes("configured") || normalized.includes("vapid")) return "Something went wrong";

  return "Something went wrong";
};

const PageNotificationPreferences = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSwitchReady, setIsSwitchReady] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<NotificationSlot>("Morning");
  const [isSavingTime, setIsSavingTime] = useState(false);

  const notificationsSupported = useMemo(
    () => "serviceWorker" in navigator && "PushManager" in window,
    [],
  );

  const refreshSubscriptionState = async () => {
    if (!notificationsSupported) {
      setIsEnabled(false);
      setIsSwitchReady(true);
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    setIsEnabled(Boolean(subscription));
    setIsSwitchReady(true);
  };

  // On mount, fetch notification preferences and subscription state
  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshSubscriptionState();
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notification-preferences`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) return;
        const prefs = await response.json();
        if (prefs?.preferredTimeLocal && prefs.preferredTimeLocal in SLOT_LOCAL_HOURS) {
          if (mounted) setSelectedSlot(prefs.preferredTimeLocal);
        } else {
          if (mounted) setSelectedSlot("Morning"); // fallback if not set
        }
      } catch {
        if (mounted) setSelectedSlot("Morning"); // fallback on error
      }
    })();
    return () => { mounted = false; };
  }, [notificationsSupported]);

  const handleSendTimeChange = async (value: string | number) => {
    const next = String(value) as NotificationSlot;
    if (!(next in SLOT_LOCAL_HOURS) || next === selectedSlot || isSavingTime) return;
    setIsSavingTime(true);
    try {
      setSelectedSlot(next);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notification-preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sendHourUtc: localHourToUtc(SLOT_LOCAL_HOURS[next]),
          sendMinuteUtc: 0,
          preferredTimeLocal: next,
        }),
      });
      if (!response.ok) {
        appToast.error("Failed to save notification time");
      }
    } finally {
      setIsSavingTime(false);
    }
  };

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      await ensurePushSubscription();
      // Save notification preferences on enable
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notification-preferences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            sendHourUtc: localHourToUtc(SLOT_LOCAL_HOURS[selectedSlot]),
            sendMinuteUtc: 0,
            preferredTimeLocal: selectedSlot,
          }),
        });
      }
      appToast.success("Notifications turned on");
      setIsEnabled(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not enable push notifications";
      appToast.error(toFriendlyNotificationError(message));
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);

    try {
      await disablePushSubscription();
      appToast.success("Notifications turned off");
      setIsEnabled(false);
    } catch {
      appToast.error("Turn off failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableSwitch = async (checked: boolean) => {
    if (isLoading) return;
    if (checked) {
      await handleEnable();
      return;
    }
    await handleDisable();
  };

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background" style={{ paddingBottom: "8px" }}>
          <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-[720px] px-6 z-40 flex items-center gap-3">
            <GlassBackButton to="/profile" />
            <h1 className="font-serif text-[22px] font-bold text-foreground">Notifications</h1>
          </div>

          <div style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "80px" }}>
            <div className="space-y-1">
              {isSwitchReady && (
                <ListCell
                  icon={<IconBellFilled className="h-6 w-6 shrink-0 text-primary" />}
                  title="Notifications"
                  right={{
                    type: "switch",
                    checked: isEnabled,
                    onCheckedChange: handleEnableSwitch,
                  }}
                />
              )}

              <ListCell
                icon={<IconClockFilled className="h-6 w-6 shrink-0 text-primary" />}
                title="Send time"
                subtitle="Sorry, CET only"
                right={{
                  type: "select",
                  options: SLOT_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                  value: selectedSlot ?? "",
                  displayValue: selectedSlot ?? "",
                  onChange: handleSendTimeChange,
                  disabled: !selectedSlot,
                }}
              />
            </div>
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default PageNotificationPreferences;
