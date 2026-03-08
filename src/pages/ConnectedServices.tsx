import { useState } from "react";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassBackButton from "@/components/GlassBackButton";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import telegramLogo from "@/assets/telegram-logo.svg";
import googleCalendarLogo from "@/assets/google-calendar-logo.svg";

const initialServices = [
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
  {
    id: "apple-health",
    name: "Apple Health",
    emoji: "🍎",
    connected: false,
    status: "Not connected",
  },
  {
    id: "home-assistant",
    name: "Home Assistant",
    emoji: "🏠",
    connected: false,
    status: "Not connected",
  },
  {
    id: "alexa",
    name: "Amazon Alexa",
    emoji: "🔊",
    connected: false,
    status: "Not connected",
  },
  {
    id: "weather",
    name: "Weather API",
    emoji: "🌤️",
    connected: false,
    status: "Not connected",
  },
  {
    id: "notion",
    name: "Notion",
    emoji: "📝",
    connected: false,
    status: "Not connected",
  },
];

const ConnectedServices = () => {
  const [services, setServices] = useState(initialServices);
  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);

  const targetService = services.find((s) => s.id === disconnectTarget);

  const handleDisconnect = () => {
    if (!disconnectTarget) return;
    setServices((prev) =>
      prev.map((s) =>
        s.id === disconnectTarget ? { ...s, connected: false, status: "Not connected" } : s
      )
    );
    setDisconnectTarget(null);
  };

  const handleConnect = (id: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, connected: true, status: "Just connected" } : s
      )
    );
  };

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
              {services.map(({ id, name, logo, emoji, connected, status }) => (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-2xl bg-card px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <img src={logo} alt={name} className="h-5 w-5 shrink-0" />
                    ) : (
                      <span className="text-lg shrink-0">{emoji}</span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{status}</p>
                    </div>
                  </div>
                  {connected ? (
                    <button
                      onClick={() => setDisconnectTarget(id)}
                      className="rounded-full bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-all"
                    >
                      Connected
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(id)}
                      className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
                    >
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disconnect confirmation modal */}
        <AnimatePresence>
          {disconnectTarget && targetService && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/40"
                onClick={() => setDisconnectTarget(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", damping: 24, stiffness: 300 }}
                className="fixed left-1/2 top-1/2 z-50 w-[85%] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)",
                  backdropFilter: "blur(40px) saturate(1.6)",
                  WebkitBackdropFilter: "blur(40px) saturate(1.6)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}
              >
                <p className="text-base font-semibold text-foreground mb-1">
                  Disconnect {targetService.name}?
                </p>
                <p className="text-xs text-muted-foreground mb-5">
                  You will stop receiving updates from this service.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDisconnectTarget(null)}
                    className="flex-1 rounded-full bg-muted py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 rounded-full py-3 text-sm font-medium text-white transition-colors"
                    style={{ background: "hsl(0 60% 55%)" }}
                  >
                    Disconnect
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default ConnectedServices;
