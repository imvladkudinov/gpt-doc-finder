import { supabase } from "@/integrations/supabase/client";

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error ?? "Unknown push error");
};

const toPushEnableErrorMessage = (error: unknown) => {
  const raw = normalizeErrorMessage(error);
  const normalized = raw.toLowerCase();

  if (normalized.includes("push service not available")) {
    return "Push service unavailable";
  }

  if (normalized.includes("missing vite_vapid_public_key") || normalized.includes("vapid")) {
    return "Push setup missing";
  }

  if (
    normalized.includes("notallowederror") ||
    normalized.includes("permission") ||
    normalized.includes("invalidstateerror") ||
    normalized.includes("aborterror") ||
    normalized.includes("you must be logged in")
  ) {
    return "Could not enable notifications";
  }

  if (normalized.includes("notification permission was not granted")) {
    return "Could not enable notifications";
  }

  return raw;
};

const base64UrlToUint8Array = (base64Url: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
  if (!buffer) return "";

  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
};

export const ensurePushSubscription = async () => {
  if (!window.isSecureContext) {
    throw new Error("Secure context required");
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Browser push unsupported");
  }

  if (!("Notification" in window)) {
    throw new Error("Notifications unavailable");
  }

  if (!import.meta.env.VITE_VAPID_PUBLIC_KEY) {
    throw new Error("Push setup missing");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notifications blocked");
  }

  const applicationServerKey = base64UrlToUint8Array(
    import.meta.env.VITE_VAPID_PUBLIC_KEY,
  ) as unknown as BufferSource;

  try {
    // Ensure registration exists for current scope before waiting for readiness.
    const registration =
      (await navigator.serviceWorker.getRegistration()) ??
      (await navigator.serviceWorker.register("/service-worker.js"));

    const existingSubscription = await registration.pushManager.getSubscription();
    const subscription =
      existingSubscription ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      }));

    const p256dhKey = arrayBufferToBase64(subscription.getKey("p256dh"));
    const authKey = arrayBufferToBase64(subscription.getKey("auth"));

    // Always get the authenticated user from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error: upsertError } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id, // Ensure this is always set to the authenticated user's ID
        endpoint: subscription.endpoint,
        p256dh_key: p256dhKey,
        auth_key: authKey,
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "endpoint",
      },
    );

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    return subscription;
  } catch (error) {
    throw new Error(toPushEnableErrorMessage(error));
  }
};

export const disablePushSubscription = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
  await subscription.unsubscribe();
};