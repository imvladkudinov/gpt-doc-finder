// @ts-nocheck
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type UserSlot = {
  user_id: string;
  send_hour_utc: number;
  send_minute_utc: number;
};

type PushRow = {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
};

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

const toUtcParts = (date: Date) => ({
  hour: date.getUTCHours(),
  minute: date.getUTCMinutes(),
  date: date.toISOString().slice(0, 10),
});

const getNotificationContent = (kind: "watering_due" | "replant_due" | "replant_week_before", names: string[]) => {
  const count = names.length;
  const firstName = names[0] ?? "your plant";

  if (kind === "watering_due") {
    if (count === 1) {
      return {
        title: `${firstName} 🪴 is calling`,
        body: "Time to water me",
      };
    }
    return {
      title: "Some plants 🪴 asked me to pass this message",
      body: "Time to water us",
    };
  }

  if (kind === "replant_due") {
    if (count === 1) {
      return {
        title: `${firstName} 🪴 is ready to be replanted`,
        body: "Hope you got some soil",
      };
    }
    return {
      title: "Some plants 🪴 are ready to be replanted",
      body: "Hope you got some soil",
    };
  }

  // replant_week_before
  if (count === 1) {
    return {
      title: `${firstName} 🪴 is due for replanting in 1 week`,
      body: "Time to buy some soil",
    };
  }
  return {
    title: "Some plants 🪴 are due for replanting in 1 week",
    body: "Time to buy some soil",
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

const selectPlantNames = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  mode: "watering_due" | "replant_due" | "replant_week_before",
) => {
  const plants = await fetchUserPlants(supabase, userId);
  if (!plants.length) return [] as string[];

  const todayIso = new Date().toISOString().slice(0, 10);

  const names: string[] = [];
  for (const plant of plants) {
    if (!plant?.name) continue;

    if (mode === "watering_due") {
      if (!plant.last_watered || !plant.watering_interval) continue;
      const lastWatered = new Date(plant.last_watered);
      const due = new Date(Date.UTC(lastWatered.getUTCFullYear(), lastWatered.getUTCMonth(), lastWatered.getUTCDate()));
      due.setUTCDate(due.getUTCDate() + Number(plant.watering_interval));
      if (due.toISOString().slice(0, 10) === todayIso) {
        names.push(plant.name);
      }
      continue;
    }

    if (!plant.last_replanted || !plant.replanting_interval) continue;

    const last = new Date(plant.last_replanted);
    const due = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()));
    due.setUTCMonth(due.getUTCMonth() + Number(plant.replanting_interval));

    const dueIso = due.toISOString().slice(0, 10);
    const weekBefore = new Date(due);
    weekBefore.setUTCDate(weekBefore.getUTCDate() - 7);
    const weekBeforeIso = weekBefore.toISOString().slice(0, 10);

    if (mode === "replant_due" && dueIso === todayIso) {
      names.push(plant.name);
    }

    if (mode === "replant_week_before" && weekBeforeIso === todayIso) {
      names.push(plant.name);
    }
  }

  return names;
};

const hasBeenSent = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  kind: "watering_due" | "replant_due" | "replant_week_before",
  dispatchDate: string,
) => {
  const { data, error } = await supabase
    .from("notification_dispatch_log")
    .select("id")
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("dispatch_date", dispatchDate)
    .limit(1)
    .maybeSingle();

  if (error) return false;
  return Boolean(data?.id);
};

const markSent = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  kind: "watering_due" | "replant_due" | "replant_week_before",
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
  notification: { title: string; body: string },
  vapidSubject: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
) => {
  const { data: pushRows, error: pushRowsError } = await supabase
    .from("push_subscriptions")
    .select("endpoint,p256dh_key,auth_key")
    .eq("user_id", userId);

  if (pushRowsError || !pushRows || pushRows.length === 0) {
    return { sent: 0, failed: 0 };
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

  for (const subscription of pushRows as PushRow[]) {
    const normalized = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: toBase64Url(subscription.p256dh_key),
        auth: toBase64Url(subscription.auth_key),
      },
    };

    try {
      await webpush.sendNotification(normalized, payload);
      sent += 1;
    } catch (error) {
      failed += 1;
      const statusCode = (error as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        staleEndpoints.push(subscription.endpoint);
      }
    }
  }

  if (staleEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().eq("user_id", userId).in("endpoint", staleEndpoints);
  }

  return { sent, failed };
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
  const utcNow = new Date();
  const { hour, minute, date } = toUtcParts(utcNow);

  const slotHours = new Set([9, 14, 20]);
  if (!slotHours.has(hour) || minute !== 0) {
    return json({
      usersChecked: 0,
      notificationsAttempted: 0,
      notificationsSent: 0,
      hour,
      minute,
      date,
      skipped: true,
    });
  }

  const { data: subscriptionUsers, error: slotsError } = await supabase
    .from("push_subscriptions")
    .select("user_id");

  if (slotsError) {
    return json({ error: slotsError.message }, 500);
  }

  const uniqueUserIds = [...new Set((subscriptionUsers ?? []).map((row) => row.user_id as string).filter(Boolean))];

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
    .select("user_id,send_hour_utc,send_minute_utc")
    .in("user_id", uniqueUserIds);

  if (preferencesError) {
    return json({ error: preferencesError.message }, 500);
  }

  const prefMap = new Map<string, { send_hour_utc: number; send_minute_utc: number }>();
  for (const row of preferencesRows ?? []) {
    prefMap.set(row.user_id as string, {
      send_hour_utc: Number(row.send_hour_utc ?? 9),
      send_minute_utc: Number(row.send_minute_utc ?? 0),
    });
  }

  const userSlotsMap = new Map<string, UserSlot>();
  for (const userId of uniqueUserIds) {
    const pref = prefMap.get(userId);
    userSlotsMap.set(userId, {
      user_id: userId,
      send_hour_utc: pref?.send_hour_utc ?? 9,
      send_minute_utc: pref?.send_minute_utc ?? 0,
    });
  }

  const targetUsers = [...userSlotsMap.values()].filter(
    (slot) => slot.send_hour_utc === hour && slot.send_minute_utc === minute,
  );

  let notificationsAttempted = 0;
  let notificationsSent = 0;

  for (const slot of targetUsers) {
    const checks: Array<"watering_due" | "replant_due" | "replant_week_before"> = [
      "watering_due",
      "replant_due",
      "replant_week_before",
    ];

    for (const kind of checks) {
      const sentAlready = await hasBeenSent(supabase, slot.user_id, kind, date);
      if (sentAlready) continue;

      const names = await selectPlantNames(supabase, slot.user_id, kind);
      if (!names.length) continue;

      const notification = getNotificationContent(kind, names);
      notificationsAttempted += 1;

      const result = await sendToUser(
        supabase,
        slot.user_id,
        notification,
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey,
      );

      if (result.sent > 0) {
        notificationsSent += 1;
        await markSent(supabase, slot.user_id, kind, date);
      }
    }
  }

  return json({
    usersChecked: targetUsers.length,
    notificationsAttempted,
    notificationsSent,
    hour,
    minute,
    date,
  });
});
