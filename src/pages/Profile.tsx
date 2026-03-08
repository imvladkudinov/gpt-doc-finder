import TabBar from "@/components/TabBar";
import { User, Bell, Shield, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

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
          </div>
        </div>

        {/* Settings list */}
        <div className="space-y-2">
          <button
            onClick={() => navigate("/connected-services")}
            className="flex w-full items-center gap-3 rounded-2xl bg-secondary px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Link className="h-4 w-4 text-muted-foreground" />
            Connected services
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-2xl bg-secondary px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            Notification preferences
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-2xl bg-secondary px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Shield className="h-4 w-4 text-muted-foreground" />
            Privacy & data
          </button>
        </div>
      </div>

      <TabBar />
    </div>
  );
};

export default Profile;
