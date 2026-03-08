import TabBar from "@/components/TabBar";
import GlassBackButton from "@/components/GlassBackButton";
import PageTransition from "@/components/PageTransition";
import telegramLogo from "@/assets/telegram-logo.svg";
import googleCalendarLogo from "@/assets/google-calendar-logo.svg";

const services = [
  {
    id: "telegram",
    name: "Telegram",
    logo: telegramLogo,
    connected: false,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    logo: googleCalendarLogo,
    connected: false,
  },
];

const ConnectedServices = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
          <GlassBackButton to="/profile" />
          <h1 className="font-serif text-lg font-bold text-foreground">Connected services</h1>
        </div>
        <div className="px-6 pt-20">
          <div className="space-y-2">
            {services.map(({ id, name, logo, connected }) => (
              <div
                key={id}
                className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-5"
              >
                <div className="flex items-center gap-3">
                  <img src={logo} alt={name} className="h-6 w-6" />
                  <p className="text-sm font-medium text-foreground">{name}</p>
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
        </div>

        <TabBar />
      </div>
    </PageTransition>
  );
};

export default ConnectedServices;
