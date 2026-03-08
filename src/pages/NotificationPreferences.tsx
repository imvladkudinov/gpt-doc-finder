import { useState } from "react";
import { Bell, CalendarPlus, MessageSquare, CheckCheck, Sparkles, Clock } from "lucide-react";
import GlassBackButton from "@/components/GlassBackButton";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";

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

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

const NotificationPreferences = () => {
  const [settings, setSettings] = useState({
    calendarEvents: true,
    messages: true,
    doubleCheck: false,
    pushNotifications: true,
    rareActivities: true,
  });
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${display} ${period}`;
  };

  return (
    <PageTransition>
      <ScrollFadeLayout>
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
                Schedule
              </p>
              <div className="rounded-2xl bg-card px-5 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Preferred time</p>
                      <p className="text-xs text-muted-foreground">When to send daily reminders</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatHour(hour)}:{String(minute).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Your plants will thank you at the time you choose 🌿
            </p>
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default NotificationPreferences;
