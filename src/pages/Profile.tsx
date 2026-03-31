import { IconUserFilled, IconHomeFilled, IconBellFilled, IconMapPinFilled, IconFileSmileFilled } from "@tabler/icons-react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import { ListCell } from "@/components/ui/ListCell";
import avatarPlant from "@/assets/avatar-plant.png";
import { supabase } from "@/integrations/supabase/client";

const glassStyle = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
  backdropFilter: "blur(40px) saturate(1.8)",
  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.5)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
};

const PageProfile = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Plant lover");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isProfileResolved, setIsProfileResolved] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;

      const metadata = data.user?.user_metadata ?? {};
      const fullName = String(metadata.full_name ?? metadata.name ?? "").trim();
      const avatar = String(metadata.avatar_url ?? metadata.picture ?? "").trim();

      setDisplayName(fullName || "Plant lover");
      setAvatarUrl(avatar || null);
      setIsProfileResolved(true);

      window.requestAnimationFrame(() => {
        if (isMounted) setIsProfileVisible(true);
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h1 className="font-serif text-[30px] font-bold text-foreground">Profile</h1>
            <button
              onClick={handleSignOut}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
              style={glassStyle}
            >
              <LogOut className="h-4 w-4 text-foreground" strokeWidth={2} />
            </button>
          </div>

          <div className="px-6">
            {/* Centered avatar + name */}
            <div className="mb-6 pt-10 flex flex-col items-center">
              <div
                className={`flex flex-col items-center transition-opacity duration-300 ${
                  isProfileResolved && isProfileVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={avatarUrl || avatarPlant}
                  alt="Profile avatar"
                  className="h-[96px] w-[96px] rounded-full object-cover"
                />
                <p className="mt-3 font-serif text-xl font-semibold text-foreground">{displayName}</p>
              </div>
            </div>

            <div className="space-y-1">
              <ListCell
                 icon={<IconUserFilled className="h-5 w-5 shrink-0 text-primary" />}
                title="Personal details"
                right={{ type: "chevron" }}
                onPress={() => navigate("/personal-details")}
              />
              <ListCell
                icon={<IconMapPinFilled className="h-5 w-5 shrink-0 text-primary" />}
                title="Homes"
                right={{ type: "chevron" }}
                onPress={() => navigate("/homes")}
              />
              <ListCell
                 icon={<IconBellFilled className="h-5 w-5 shrink-0 text-primary" />}
                title="Notifications"
                right={{ type: "chevron" }}
                onPress={() => navigate("/notification-preferences")}
              />
              <ListCell
                icon={<IconFileSmileFilled className="h-5 w-5 shrink-0 text-primary" />}
                title="Legal stuff"
                right={{ type: "chevron" }}
                onPress={() => navigate("/legal")}
              />
            </div>
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default PageProfile;
