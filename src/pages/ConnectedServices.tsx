import { ArrowLeft, MessageCircle, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TabBar from "@/components/TabBar";

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
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-6 pt-12 pb-4">
        <button
          onClick={() => navigate("/profile")}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
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
