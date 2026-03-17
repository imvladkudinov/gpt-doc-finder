import { useEffect, useMemo, useState } from "react";
import { Bell, Clock3 } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import GlassBackButton from "@/components/GlassBackButton";
import { ListCell } from "@/components/ui/ListCell";
import { ensurePushSubscription, disablePushSubscription } from "@/lib/device-notifications";
import { appToast } from "@/lib/app-toast";
import { supabase } from "@/integrations/supabase/client";

const SLOT_TO_UTC_HOUR = {
  Morning: 9,
  Day: 14,
  Evening: 20,
} as const;

const SLOT_OPTIONS = [
  { value: "Morning", label: "Morning (09:00)" },
  { value: "Day", label: "Day (14:00)" },
  { value: "Evening", label: "Evening (20:00)" },
] as const;

type NotificationSlot = keyof typeof SLOT_TO_UTC_HOUR;

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
  const [isTesting, setIsTesting] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<NotificationSlot>("Morning");
  const [isSavingTime, setIsSavingTime] = useState(false);

  const notificationsSupported = useMemo(
    () => "serviceWorker" in navigator && "PushManager" in window,
    [],
  );

  const refreshSubscriptionState = async () => {
    if (!notificationsSupported) {
      setIsEnabled(false);
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    setIsEnabled(Boolean(subscription));
  };

  useEffect(() => {
    refreshSubscriptionState();
  }, [notificationsSupported]);

  useEffect(() => {
    const loadPreferences = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notification-preferences`,
          {
            method: "GET",
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );

        if (!response.ok) return;

        const data = (await response.json()) as { preferredTimeLocal?: string };
        const slot = data.preferredTimeLocal as NotificationSlot;
        if (slot && slot in SLOT_TO_UTC_HOUR) {
          setSelectedSlot(slot);
        }
      } catch {
        // Keep default time if request fails.
      }
    };

    loadPreferences();
  }, []);

  const savePreferredSlot = async (slot: NotificationSlot) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    setIsSavingTime(true);
    try {
      const sendHourUtc = SLOT_TO_UTC_HOUR[slot];
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notification-preferences`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            preferredTimeLocal: slot,
            sendHourUtc,
            sendMinuteUtc: 0,
          }),
        },
      );

      if (!response.ok) {
        appToast.error("Save time failed");
        return;
      }

      appToast.success("Time saved");
    } catch {
      appToast.error("Save time failed");
    } finally {
      setIsSavingTime(false);
    }
  };

  const handleSendTimeChange = (value: string | number) => {
    const next = String(value) as NotificationSlot;
    if (!(next in SLOT_TO_UTC_HOUR) || next === selectedSlot || isSavingTime) return;
    setSelectedSlot(next);
    savePreferredSlot(next);
  };

  const handleEnable = async () => {
    setIsLoading(true);

    try {
      await ensurePushSubscription();
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

  const handleTestNotification = async () => {
    setIsTesting(true);

    try {
      await ensurePushSubscription();
      await refreshSubscriptionState();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: "Planty",
          body: "Test notification delivered",
          url: "/plants",
        }),
      });

      let data: { sent?: number } = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        const errorMessage =
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : `Test notification failed (${response.status})`;
        appToast.error(toFriendlyNotificationError(errorMessage));
        return;
      }

      const sent = Number(data?.sent ?? 0);
      if (sent > 0) {
        appToast.success("Test alert sent");
      } else {
        appToast.info("No devices connected");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Test notification failed";
      appToast.error(toFriendlyNotificationError(message));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
            <GlassBackButton to="/profile" />
            <h1 className="font-serif text-[20px] font-bold text-foreground">Notifications</h1>
          </div>

          <div className="px-6 pt-20">
            <div className="space-y-1">
              <ListCell
                icon={<Bell className="h-5 w-5 shrink-0 text-primary" />}
                title="Notifications"
                right={{
                  type: "switch",
                  checked: isEnabled,
                  onCheckedChange: handleEnableSwitch,
                }}
              />

              <ListCell
                icon={<Clock3 className="h-5 w-5 shrink-0 text-primary" />}
                title="Send time"
                subtitle="Sorry, UTC only due to cost efficiency"
                right={{
                  type: "select",
                  options: SLOT_OPTIONS as unknown as Array<{ value: string | number; label: string }>,
                  value: selectedSlot,
                  displayValue: selectedSlot,
                  onChange: handleSendTimeChange,
                }}
              />

              <ListCell
                icon={<Bell className="h-5 w-5 shrink-0 text-primary" />}
                title="Send test notification"
                right={{
                  type: "button-low",
                  label: isTesting ? "Working..." : "Send test",
                  variant: "secondary",
                  onPress: handleTestNotification,
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
