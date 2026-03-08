import { MessageCircle, CalendarDays } from "lucide-react";
import TabBar from "@/components/TabBar";
import GlassBackButton from "@/components/GlassBackButton";

const services = [
  {
    id: "telegram",
    name: "Telegram",
    icon: MessageCircle,
    connected: false,
    description: "Get watering reminders via Telegram",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: CalendarDays,
    connected: false,
    description: "Sync watering schedule to your calendar",
  },
];

const ConnectedServices = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed top-6 left-6 z-40">
        <GlassBackButton to="/profile" />
      </div>
      <div className="px-6 pt-20 pb-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Connected services</h1>
      </div>

      <div className="space-y-2 px-6">
        {services.map(({ id, name, icon: Icon, connected, description }) => (
          <div
            key={id}
            className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            <button
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                connected
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>

      <TabBar />
    </div>
  );
};

export default ConnectedServices;
