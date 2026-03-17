import { supabase } from "@/integrations/supabase/client";

export const syncCurrentUserProfile = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return;

  const metadata = data.user.user_metadata ?? {};
  const fullName = String(metadata.full_name ?? metadata.name ?? "").trim();
  const avatarUrl = String(metadata.avatar_url ?? metadata.picture ?? "").trim();

  await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName || null,
    avatar_url: avatarUrl || null,
    updated_at: new Date().toISOString(),
  });
};
