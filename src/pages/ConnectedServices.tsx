import { MessageCircle, CalendarDays, Check } from "lucide-react";
import TabBar from "@/components/TabBar";
import GlassBackButton from "@/components/GlassBackButton";

const services = [
  {
    id: "telegram",
    name: "Telegram",
    icon: MessageCircle,
    connected: true,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: CalendarDays,
    connected: true,
  },
];

const ConnectedServices = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
        <GlassBackButton to="/profile" />
        <h1 className="font-serif text-lg font-bold text-foreground">Connected services</h1>
      </div>
      <div className="px-6 pt-20">
        <div className="space-y-2">
          {services.map(({ id, name, connected }) => (
            <div
              key={id}
              className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-4"
            >
              <div className="flex items-center gap-3">
                {id === "telegram" ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-2.02 1.28-5.7 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.41-.27-2.1-.5-.85-.28-1.52-.43-1.46-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .37z" fill="hsl(var(--primary))"/>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M18 4H6C4.9 4 4 4.9 4 6v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="hsl(var(--primary))" opacity="0.15"/>
                    <path d="M17 10H7v2h10v-2zm0 4H7v2h10v-2zm-5-8h5v2h-5V6zm-5 0h4v4H7V6z" fill="hsl(var(--primary))"/>
                  </svg>
                )}
                <p className="text-sm font-medium text-foreground">{name}</p>
              </div>
              {connected && (
                <div className="flex items-center gap-1.5 text-primary">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  <span className="text-xs font-medium">Connected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <TabBar />
    </div>
  );
};

export default ConnectedServices;
