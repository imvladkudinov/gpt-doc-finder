import { Bell, Shield, Link, ChevronRight, Leaf, LogOut, Crown, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import avatarPlant from "@/assets/avatar-plant.png";

const glassStyle = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
  backdropFilter: "blur(40px) saturate(1.8)",
  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.5)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
};

const Profile = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h1 className="font-serif text-2xl font-bold text-foreground">Profile</h1>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
              style={glassStyle}
            >
              <LogOut className="h-4 w-4 text-foreground" strokeWidth={2} />
            </button>
          </div>

          <div className="px-6">
            {/* Centered avatar + name + premium label */}
            <div className="mb-6 flex flex-col items-center">
              <img
                src={avatarPlant}
                alt="Profile avatar"
                className="h-24 w-24 rounded-3xl object-cover"
              />
              <p className="mt-3 font-serif text-xl font-semibold text-foreground">Alejandra García</p>
              <div className="mt-1 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1">
                <Crown className="h-3 w-3 text-white" />
                <span className="text-xs font-semibold text-white">Premium</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate("/personal-details")}
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left text-sm font-medium text-foreground transition-colors active:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-primary" />
                  Personal details
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate("/connected-services")}
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left text-sm font-medium text-foreground transition-colors active:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Link className="h-4 w-4 text-primary" />
                  Connected services
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">2</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
              <button
                onClick={() => navigate("/notification-preferences")}
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left text-sm font-medium text-foreground transition-colors active:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-primary" />
                  Notification preferences
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate("/plant-personalization")}
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left text-sm font-medium text-foreground transition-colors active:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Leaf className="h-4 w-4 text-primary" />
                  Plant personalization
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left text-sm font-medium text-foreground transition-colors active:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-primary" />
                  Privacy & data
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-4 w-full text-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              To onboard
            </button>
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default Profile;
