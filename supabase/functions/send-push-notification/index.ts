import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type PushRow = {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
};

type PushRequestBody = {
  title?: string;
  body?: string;
  url?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const toBase64Url = (value: string) =>
  value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");

  if (!supabaseUrl || !supabaseAnonKey || !vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return new Response(JSON.stringify({ error: "Missing required function secrets" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
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
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const { data: pushRows, error: pushRowsError } = await supabase
    .from("push_subscriptions")
    .select("endpoint,p256dh_key,auth_key")
    .eq("user_id", user.id);

  if (pushRowsError) {
    return new Response(JSON.stringify({ error: pushRowsError.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const subscriptions = (pushRows ?? []) as PushRow[];
  if (subscriptions.length === 0) {
    return new Response(JSON.stringify({ sent: 0, failed: 0, message: "No subscriptions found" }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  let body: PushRequestBody = {};
  try {
    body = (await request.json()) as PushRequestBody;
  } catch {
    body = {};
  }

  const payload = JSON.stringify({
    title: body.title ?? "Planty",
    body: body.body ?? "This is your test notification",
    url: body.url ?? "/plants",
  });

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const staleEndpoints: string[] = [];
  let sent = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    const normalizedSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: toBase64Url(subscription.p256dh_key),
        auth: toBase64Url(subscription.auth_key),
      },
    };

    try {
      await webpush.sendNotification(normalizedSubscription, payload);
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
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .in("endpoint", staleEndpoints);
  }

  return new Response(JSON.stringify({ sent, failed }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});
