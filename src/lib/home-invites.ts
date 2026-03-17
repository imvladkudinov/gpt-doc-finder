import { supabase } from "@/integrations/supabase/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const sendHomeInvite = async (homeId: string, email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { ok: false, message: "Enter an email" };
  if (!EMAIL_PATTERN.test(normalizedEmail)) return { ok: false, message: "Use valid email" };

  const { data: userData } = await supabase.auth.getUser();
  const currentEmail = (userData.user?.email ?? "").toLowerCase();
  if (normalizedEmail === currentEmail) {
    return { ok: false, message: "Cannot invite yourself" };
  }

  const { data, error } = await supabase.rpc("invite_user_to_home_by_email", {
    target_home_id: homeId,
    target_email: normalizedEmail,
  });

  if (error) {
    return { ok: false, message: "Member add failed" };
  }

  if (data === "added") {
    return { ok: true, message: "New member added" };
  }

  if (data === "already_member") {
    return { ok: false, message: "Already in home" };
  }

  if (data === "user_not_found") {
    return { ok: false, message: "No account found" };
  }

  if (data === "forbidden") {
    return { ok: false, message: "No invite access" };
  }

  if (data === "self_invite") {
    return { ok: false, message: "Cannot invite yourself" };
  }

  return { ok: false, message: "Member add failed" };
};
