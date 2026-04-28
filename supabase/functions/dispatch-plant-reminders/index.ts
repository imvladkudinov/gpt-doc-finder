// @ts-nocheck
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type NotificationSlot = "Morning" | "Day" | "Evening";

type UserSlot = {
  user_id: string;
  slot: NotificationSlot;
};

const SLOT_CET_HOURS: Record<NotificationSlot, number> = {
  Morning: 9,
  Day: 14,
  Evening: 20,
};

type PushRow = {
  user_id?: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
};

type NotificationKind = "watering_due" | "replant_due" | "replant_week_before";

type DueNamesByKind = Record<NotificationKind, string[]>;

type UserPlant = {
  name: string;
  last_watered: string;
  watering_interval: number;
  last_replanted: string;
  replanting_interval: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const toBase64Url = (value: string) => value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const toCetParts = (date: Date) => {
  const cetDate = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Warsaw" }));
  return {
    hour: cetDate.getHours(),
    minute: cetDate.getMinutes(),
    date: `${cetDate.getFullYear()}-${String(cetDate.getMonth() + 1).padStart(2, "0")}-${String(cetDate.getDate()).padStart(2, "0")}`,
  };
};

const toMinutesOfDay = (hour: number, minute: number) => (hour * 60) + minute;

const getNotificationContent = (kind: NotificationKind, names: string[]) => {
  const count = names.length;
  const firstName = names[0] ?? "your plant";

  if (kind === "watering_due") {
    if (count === 1) {
      return {
        title: "Incoming message",
        body: `Time to water ${firstName} 🪴`,
      };
    }
    return {
      title: "Incoming message",
      body: "Some plants 🪴 need watering",
    };
  }

  if (kind === "replant_due") {
    if (count === 1) {
      return {
        title: "Incoming message",
        body: `${firstName} 🪴 is ready for replanting`,
      };
    }
    return {
      title: "Incoming message",
      body: "Some plants 🪴 are ready for replanting",
    };
  }

  // replant_week_before
  if (count === 1) {
    return {
      title: "Incoming message",
      body: `${firstName} 🪴 needs replanting in 1 week`,
    };
  }
  return {
    title: "Incoming message",
    body: "Some plants 🪴 need replanting in 1 week",
  };
};

const fetchUserPlants = async (supabase: ReturnType<typeof createClient>, userId: string): Promise<UserPlant[]> => {
  const { data, error } = await supabase
    .from("home_members")
    .select("homes!inner(plants(name,last_watered,watering_interval,last_replanted,replanting_interval))")
    .eq("user_id", userId);

  if (error) return [];

  const plants: UserPlant[] = [];

  for (const row of data ?? []) {
    const homesRelation = row.homes;
    const homes = Array.isArray(homesRelation) ? homesRelation : [homesRelation];

    for (const home of homes) {
      const homePlants = Array.isArray(home?.plants) ? home.plants : [];
      for (const plant of homePlants) {
        if (!plant?.name) continue;
        plants.push(plant as UserPlant);
      }
    }
  }

  return plants;
};

const getDuePlantNamesByKind = (plants: UserPlant[], todayIso: string): DueNamesByKind => {
  const namesByKind: DueNamesByKind = {
    watering_due: [],
    replant_due: [],
    replant_week_before: [],
  };

  for (const plant of plants) {
    if (!plant?.name) continue;

    if (plant.last_watered && plant.watering_interval) {
      const lastWatered = new Date(plant.last_watered);
      const wateringDue = new Date(Date.UTC(
        lastWatered.getUTCFullYear(),
        lastWatered.getUTCMonth(),
        lastWatered.getUTCDate(),
      ));
      wateringDue.setUTCDate(wateringDue.getUTCDate() + Number(plant.watering_interval));
      if (wateringDue.toISOString().slice(0, 10) <= todayIso) {
        namesByKind.watering_due.push(plant.name);
      }
    }

    if (plant.last_replanted && plant.replanting_interval) {
      const last = new Date(plant.last_replanted);
      const replantDue = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()));
      replantDue.setUTCMonth(replantDue.getUTCMonth() + Number(plant.replanting_interval));

      const dueIso = replantDue.toISOString().slice(0, 10);
      const weekBefore = new Date(replantDue);
      weekBefore.setUTCDate(weekBefore.getUTCDate() - 7);
      const weekBeforeIso = weekBefore.toISOString().slice(0, 10);

      if (dueIso <= todayIso) {
        namesByKind.replant_due.push(plant.name);
      }

      if (weekBeforeIso === todayIso) {
        namesByKind.replant_week_before.push(plant.name);
      }
    }
  }

  return namesByKind;
};

const markSent = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  kind: NotificationKind,
  dispatchDate: string,
) => {
  await supabase.from("notification_dispatch_log").insert({
    user_id: userId,
    kind,
    dispatch_date: dispatchDate,
  });
};

const sendToUser = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  subscriptions: PushRow[],
  notification: { title: string; body: string },
  vapidSubject: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
) => {
  if (!subscriptions.length) {
    return { sent: 0, failed: 0, hadSubscriptions: false };
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    url: "/plants",
  });

  let sent = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];

  const concurrency = Math.max(1, Number(Deno.env.get("PUSH_SEND_CONCURRENCY") ?? "8"));

  for (let index = 0; index < subscriptions.length; index += concurrency) {
    const batch = subscriptions.slice(index, index + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (subscription) => {
        const normalized = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: toBase64Url(subscription.p256dh_key),
            auth: toBase64Url(subscription.auth_key),
          },
        };

        try {
          await webpush.sendNotification(normalized, payload);
          return { sent: 1, failed: 0, staleEndpoint: "" };
        } catch (error) {
          const statusCode = (error as { statusCode?: number })?.statusCode;
          return {
            sent: 0,
            failed: 1,
            staleEndpoint: statusCode === 404 || statusCode === 410 ? subscription.endpoint : "",
          };
        }
      }),
    );

    for (const result of batchResults) {
      sent += result.sent;
      failed += result.failed;
      if (result.staleEndpoint) {
        staleEndpoints.push(result.staleEndpoint);
      }
    }
  }

  if (staleEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().eq("user_id", userId).in("endpoint", staleEndpoints);
  }

  return { sent, failed, hadSubscriptions: true };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return json({ error: "Missing function secrets" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { hour, minute, date } = toCetParts(new Date());

  // GitHub scheduled workflows can start late. Process catch-up sends for today
  // (after a user's configured slot) and rely on dispatch_log for de-duplication.
  const nowMinutes = toMinutesOfDay(hour, minute);

  const { data: subscriptionUsers, error: slotsError } = await supabase
    .from("push_subscriptions")
    .select("user_id,endpoint,p256dh_key,auth_key");

  if (slotsError) {
    return json({ error: slotsError.message }, 500);
  }

  const subscriptionsByUser = new Map<string, PushRow[]>();
  for (const row of (subscriptionUsers ?? []) as PushRow[]) {
    const userId = row.user_id;
    if (!userId) continue;

    if (!subscriptionsByUser.has(userId)) {
      subscriptionsByUser.set(userId, []);
    }

    subscriptionsByUser.get(userId)?.push({
      endpoint: row.endpoint,
      p256dh_key: row.p256dh_key,
      auth_key: row.auth_key,
    });
  }

  const uniqueUserIds = [...subscriptionsByUser.keys()];

  if (uniqueUserIds.length === 0) {
    return json({
      usersChecked: 0,
      notificationsAttempted: 0,
      notificationsSent: 0,
      hour,
      minute,
      date,
    });
  }

  const { data: preferencesRows, error: preferencesError } = await supabase
    .from("notification_preferences")
    .select("user_id,preferred_time_local")
    .in("user_id", uniqueUserIds);

  if (preferencesError) {
    return json({ error: preferencesError.message }, 500);
  }

  const prefMap = new Map<string, NotificationSlot>();
  for (const row of preferencesRows ?? []) {
    const slot = row.preferred_time_local as NotificationSlot;
    if (slot in SLOT_CET_HOURS) {
      prefMap.set(row.user_id as string, slot);
    }
  }

  const userSlotsMap = new Map<string, UserSlot>();
  for (const userId of uniqueUserIds) {
    userSlotsMap.set(userId, {
      user_id: userId,
      slot: prefMap.get(userId) ?? "Morning",
    });
  }

  const TOLERANCE_MINUTES = 60;

  const targetUsers = [...userSlotsMap.values()].filter((slot) => {
    const slotHour = SLOT_CET_HOURS[slot.slot];
    const slotMinutes = toMinutesOfDay(slotHour, 0);
    const matched = nowMinutes >= slotMinutes - TOLERANCE_MINUTES;
    console.log(`[dispatch] user=${slot.user_id} slotCET=${slotHour}:00 (${slot.slot}) nowMinutes=${nowMinutes} slotMinutes=${slotMinutes} tolerance=${TOLERANCE_MINUTES} matched=${matched}`);
    return matched;
  });

  const { data: sentRows, error: sentRowsError } = await supabase
    .from("notification_dispatch_log")
    .select("user_id,kind")
    .eq("dispatch_date", date)
    .in("user_id", uniqueUserIds);

  if (sentRowsError) {
    return json({ error: sentRowsError.message }, 500);
  }

  const sentKindsByUser = new Map<string, Set<NotificationKind>>();
  for (const row of sentRows ?? []) {
    const userId = row.user_id as string;
    const kind = row.kind as NotificationKind;

    if (!sentKindsByUser.has(userId)) {
      sentKindsByUser.set(userId, new Set<NotificationKind>());
    }

    sentKindsByUser.get(userId)?.add(kind);
  }

  const diagnostics = {
    runMinuteOfDayUtc: nowMinutes,
    usersWithSubscriptions: uniqueUserIds.length,
    usersMatchedSchedule: targetUsers.length,
    checksRun: 0,
    skippedAlreadySent: 0,
    skippedNoDuePlants: 0,
    skippedNoSubscriptions: 0,
    deliveryFailures: 0,
    attemptedByKind: {
      watering_due: 0,
      replant_due: 0,
      replant_week_before: 0,
    },
    sentByKind: {
      watering_due: 0,
      replant_due: 0,
      replant_week_before: 0,
    },
  };

  let notificationsAttempted = 0;
  let notificationsSent = 0;

  for (const slot of targetUsers) {
    const checks: Array<"watering_due" | "replant_due" | "replant_week_before"> = [
      "watering_due",
      "replant_due",
      "replant_week_before",
    ];

    const sentKinds = sentKindsByUser.get(slot.user_id) ?? new Set<NotificationKind>();
    const userPlants = await fetchUserPlants(supabase, slot.user_id);
    const dueNamesByKind = getDuePlantNamesByKind(userPlants, date);
    const subscriptions = subscriptionsByUser.get(slot.user_id) ?? [];

    for (const kind of checks) {
      diagnostics.checksRun += 1;

      if (sentKinds.has(kind)) {
        diagnostics.skippedAlreadySent += 1;
        continue;
      }

      const names = dueNamesByKind[kind] ?? [];
      if (!names.length) {
        diagnostics.skippedNoDuePlants += 1;
        continue;
      }

      if (!subscriptions.length) {
        diagnostics.skippedNoSubscriptions += 1;
        continue;
      }

      const notification = getNotificationContent(kind, names);
      notificationsAttempted += 1;
      diagnostics.attemptedByKind[kind] += 1;

      const result = await sendToUser(
        supabase,
        slot.user_id,
        subscriptions,
        notification,
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey,
      );

      diagnostics.deliveryFailures += result.failed;

      if (result.sent > 0) {
        notificationsSent += 1;
        diagnostics.sentByKind[kind] += 1;
        await markSent(supabase, slot.user_id, kind, date);
        sentKinds.add(kind);
      }
    }
  }

  const result = {
    usersChecked: targetUsers.length,
    notificationsAttempted,
    notificationsSent,
    hour,
    minute,
    date,
    diagnostics,
  };

  console.log("[dispatch-plant-reminders] result:", JSON.stringify(result));

  return json(result);
});
