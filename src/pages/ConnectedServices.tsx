import { Check, Plus } from "lucide-react";
import GlassBackButton from "@/components/GlassBackButton";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import telegramLogo from "@/assets/telegram-logo.svg";
import googleCalendarLogo from "@/assets/google-calendar-logo.svg";

const services = [
  {
    id: "telegram",
    name: "Telegram",
    logo: telegramLogo,
    connected: true,
    status: "Notifications active",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    logo: googleCalendarLogo,
    connected: true,
    status: "Syncing schedule",
  },
];

const ConnectedServices = () => {
  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
            <GlassBackButton to="/profile" />
            <h1 className="font-serif text-lg font-bold text-foreground">Connected services</h1>
          </div>
          <div className="px-6 pt-20">
            <div className="space-y-2">
              {services.map(({ id, name, logo, connected, status }) => (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-2xl bg-card px-4 py-5"
                >
                  <div className="flex items-center gap-3">
                    <img src={logo} alt={name} className="h-6 w-6" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{status}</p>
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

              <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 py-5 transition-colors hover:bg-secondary">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                  <Plus className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-medium text-foreground">Add service</span>
              </button>
            </div>
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default ConnectedServices;
