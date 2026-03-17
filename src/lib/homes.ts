import { supabase } from "@/integrations/supabase/client";

const ACTIVE_HOME_ID_KEY = "active_home_id";
const DEFAULT_HOME_NAME = "My home";

interface HomeMembershipRow {
  home_id: string;
}

const getStoredActiveHomeId = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_HOME_ID_KEY);
};

const setStoredActiveHomeId = (homeId: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_HOME_ID_KEY, homeId);
};

export const getActiveHomeId = () => getStoredActiveHomeId();

export const setActiveHomeId = (homeId: string) => {
  setStoredActiveHomeId(homeId);
};

export const clearStoredActiveHomeId = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_HOME_ID_KEY);
};

const ensureHomeForCurrentUser = async () => {
  const { data, error } = await supabase.rpc("ensure_current_user_home", {
    default_home_name: DEFAULT_HOME_NAME,
  });

  if (error || !data) return null;

  return data as string;
};

export const ensureActiveHomeForCurrentUser = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const userId = userData.user.id;

  const { data: membershipsData, error: membershipsError } = await supabase
    .from("home_members")
    .select("home_id")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true });

  if (membershipsError) return null;

  const memberships = (membershipsData ?? []) as HomeMembershipRow[];

  const stored = getStoredActiveHomeId();
  if (stored && memberships.some((item) => item.home_id === stored)) {
    return stored;
  }

  if (memberships.length > 0) {
    const nextHomeId = memberships[0].home_id;
    setStoredActiveHomeId(nextHomeId);
    return nextHomeId;
  }

  const createdHomeId = await ensureHomeForCurrentUser();
  if (!createdHomeId) return null;

  setStoredActiveHomeId(createdHomeId);
  return createdHomeId;
};

export const leaveHomeAndEnsureFallback = async (homeId: string) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const userId = userData.user.id;

  const { error: deleteError } = await supabase
    .from("home_members")
    .delete()
    .eq("home_id", homeId)
    .eq("user_id", userId);

  if (deleteError) return null;

  return ensureActiveHomeForCurrentUser();
};

export const deleteHomeAndEnsureFallback = async (homeId: string) => {
  const { error } = await supabase
    .from("homes")
    .delete()
    .eq("id", homeId);

  if (error) return null;

  const nextHomeId = await ensureActiveHomeForCurrentUser();
  if (!nextHomeId) return null;

  setStoredActiveHomeId(nextHomeId);
  return nextHomeId;
};
