import TabBar from "@/components/TabBar";
import { User, Crown, Bell, Shield } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pt-12 pb-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="px-6">
        {/* User info */}
        <div className="glass mb-6 flex items-center gap-4 rounded-3xl p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-100">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-foreground">Plant Parent</p>
            <p className="text-sm text-muted-foreground">Free plan</p>
          </div>
        </div>

        {/* Upgrade card */}
        <div className="mb-6 rounded-3xl bg-primary p-5 text-primary-foreground">
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5" />
            <h3 className="font-serif text-base font-semibold">Unlock premium plant care</h3>
          </div>
          <p className="mb-4 text-sm opacity-90">
            Multi-channel reminders, AI schedule adjustments, and detailed insights for all your plants.
          </p>
          <button className="w-full rounded-2xl bg-primary-foreground py-3 text-sm font-medium text-primary transition-all hover:opacity-90">
            Upgrade for smarter care
          </button>
          <p className="mt-2 text-center text-xs opacity-70">
            No credit card required for free plan
          </p>
        </div>

        {/* Settings list */}
        <div className="space-y-2">
          {[
            { icon: Bell, label: "Notification preferences" },
            { icon: Shield, label: "Privacy & data" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex w-full items-center gap-3 rounded-2xl bg-secondary px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          We respect your time and privacy 🌱
        </p>
      </div>

      <TabBar />
    </div>
  );
};

export default Profile;
