import { User, Bell, Shield, Link, ChevronRight, Leaf, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";

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
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                backdropFilter: "blur(40px) saturate(1.8)",
                WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <LogOut className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
            </button>
          </div>

          <div className="px-6">
            <div className="mb-6 flex items-center gap-4 rounded-3xl bg-card p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-serif text-lg font-semibold text-foreground">Plant Parent</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate("/connected-services")}
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
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
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-primary" />
                  Notification preferences
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate("/plant-personalization")}
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Leaf className="h-4 w-4 text-primary" />
                  Plant personalization
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-primary" />
                  Privacy & data
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default Profile;
