import { createClient } from "jsr:@supabase/supabase-js@2";

type PreferencesPayload = {
  sendHourUtc?: number;
  sendMinuteUtc?: number;
  preferredTimeLocal?: string;
};

const ALLOWED_SLOT_LABELS = new Set(["Morning", "Day", "Evening"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Missing function env" }, 500);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return json({ error: "Missing Authorization header" }, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (request.method === "GET") {
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("send_hour_utc,send_minute_utc,preferred_time_local")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json({
      sendHourUtc: data?.send_hour_utc ?? 9,
      sendMinuteUtc: data?.send_minute_utc ?? 0,
      preferredTimeLocal: data?.preferred_time_local ?? "Morning",
    });
  }

  let payload: PreferencesPayload = {};
  try {
    payload = (await request.json()) as PreferencesPayload;
  } catch {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  const sendHourUtc = Number(payload.sendHourUtc);
  const sendMinuteUtc = Number(payload.sendMinuteUtc);
  const preferredTimeLocal = String(payload.preferredTimeLocal ?? "").trim();

  if (!Number.isInteger(sendHourUtc) || sendHourUtc < 0 || sendHourUtc > 23) {
    return json({ error: "Invalid sendHourUtc" }, 400);
  }

  if (!Number.isInteger(sendMinuteUtc) || sendMinuteUtc !== 0) {
    return json({ error: "Invalid sendMinuteUtc" }, 400);
  }

  if (!ALLOWED_SLOT_LABELS.has(preferredTimeLocal)) {
    return json({ error: "Invalid preferredTimeLocal" }, 400);
  }

  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: user.id,
      send_hour_utc: sendHourUtc,
      send_minute_utc: sendMinuteUtc,
      preferred_time_local: preferredTimeLocal,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({
    sendHourUtc,
    sendMinuteUtc,
    preferredTimeLocal,
  });
});
