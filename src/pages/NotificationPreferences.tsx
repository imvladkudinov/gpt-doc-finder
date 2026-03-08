import { useState } from "react";
import { Bell, CalendarPlus, MessageSquare, CheckCheck, Sparkles, Clock } from "lucide-react";
import GlassBackButton from "@/components/GlassBackButton";
import PageTransition from "@/components/PageTransition";

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const ToggleRow = ({ icon, label, description, enabled, onToggle }: ToggleRowProps) => (
  <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-5">
    <div className="flex items-center gap-3 pr-4">
      {icon}
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        enabled ? "bg-primary" : "bg-muted"
      }`}
    >
      <div
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  </div>
);

const TIME_OPTIONS = [
  { label: "Morning", time: "8:00 AM", emoji: "🌅" },
  { label: "Afternoon", time: "1:00 PM", emoji: "☀️" },
  { label: "Evening", time: "6:00 PM", emoji: "🌇" },
  { label: "Night", time: "9:00 PM", emoji: "🌙" },
];

const NotificationPreferences = () => {
  const [settings, setSettings] = useState({
    calendarEvents: true,
    messages: true,
    doubleCheck: false,
    pushNotifications: true,
    rareActivities: true,
  });
  const [selectedTime, setSelectedTime] = useState("Morning");

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
          <GlassBackButton to="/profile" />
          <h1 className="font-serif text-lg font-bold text-foreground">Notifications</h1>
        </div>

        <div className="space-y-6 px-6 pt-20">
          {/* Notification types */}
          <div>
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Notification types
            </p>
            <div className="space-y-2">
              <ToggleRow
                icon={<CalendarPlus className="h-4 w-4 shrink-0 text-primary" />}
                label="Add events to calendar"
                description="Auto-create watering events in your calendar"
                enabled={settings.calendarEvents}
                onToggle={() => toggle("calendarEvents")}
              />
              <ToggleRow
                icon={<MessageSquare className="h-4 w-4 shrink-0 text-primary" />}
                label="Send messages"
                description="Receive reminders via connected services"
                enabled={settings.messages}
                onToggle={() => toggle("messages")}
              />
              <ToggleRow
                icon={<CheckCheck className="h-4 w-4 shrink-0 text-primary" />}
                label="Double-check messages"
                description="Get a follow-up if you haven't marked as watered"
                enabled={settings.doubleCheck}
                onToggle={() => toggle("doubleCheck")}
              />
              <ToggleRow
                icon={<Bell className="h-4 w-4 shrink-0 text-primary" />}
                label="Push notifications"
                description="Direct notifications on your device"
                enabled={settings.pushNotifications}
                onToggle={() => toggle("pushNotifications")}
              />
              <ToggleRow
                icon={<Sparkles className="h-4 w-4 shrink-0 text-primary" />}
                label="Rare activities"
                description="Replanting, fertilizing, and seasonal tips"
                enabled={settings.rareActivities}
                onToggle={() => toggle("rareActivities")}
              />
            </div>
          </div>

          {/* Preferred time */}
          <div>
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preferred time
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map(({ label, time, emoji }) => (
                <button
                  key={label}
                  onClick={() => setSelectedTime(label)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-4 transition-all ${
                    selectedTime === label
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium">{label}</p>
                    <p
                      className={`text-xs ${
                        selectedTime === label
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {time}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Your plants will thank you at the time you choose 🌿
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotificationPreferences;
