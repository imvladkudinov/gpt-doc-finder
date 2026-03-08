import { useState, useRef, useEffect } from "react";
import { Bell, CalendarPlus, MessageSquare, CheckCheck, Sparkles, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
        enabled ? "bg-primary" : "bg-muted-foreground/30"
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
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const WheelPicker = ({
  items,
  value,
  onChange,
  formatItem,
}: {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  formatItem: (v: number) => string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (containerRef.current && !isScrollingRef.current) {
      const idx = items.indexOf(value);
      containerRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  }, [value, items]);

  const handleScroll = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isScrollingRef.current = true;
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const idx = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(idx, items.length - 1));
        containerRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
        onChange(items[clamped]);
      }
      isScrollingRef.current = false;
    }, 80);
  };

  return (
    <div className="relative flex-1" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
      {/* Selection highlight */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-10 rounded-xl bg-sage-100"
        style={{ top: ITEM_HEIGHT * 2, height: ITEM_HEIGHT }}
      />
      {/* Fade top */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-20 bg-gradient-to-b from-card to-transparent" />
      {/* Fade bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-20 bg-gradient-to-t from-card to-transparent" />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-none"
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-center text-lg font-semibold text-foreground"
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: "start" }}
          >
            {formatItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState(8);
  const [tempMinute, setTempMinute] = useState(0);

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const openPicker = () => {
    setTempHour(hour);
    setTempMinute(minute);
    setShowTimePicker(true);
  };

  const applyTime = () => {
    setHour(tempHour);
    setMinute(tempMinute);
    setShowTimePicker(false);
  };

  const timeDisplay = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
            <GlassBackButton to="/profile" />
            <h1 className="font-serif text-lg font-bold text-foreground">Notifications</h1>
          </div>

          <div className="space-y-6 px-6 pt-20">
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

            <div>
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Schedule
              </p>
              <button
                onClick={openPicker}
                className="w-full rounded-2xl bg-card px-5 py-5 text-left transition-colors active:bg-secondary"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Preferred time</p>
                      <p className="text-xs text-muted-foreground">When to send daily reminders</p>
                    </div>
                  </div>
                  <span className="rounded-xl bg-sage-100 px-3 py-1.5 text-sm font-semibold text-primary">
                    {timeDisplay}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </ScrollFadeLayout>

      {/* Time picker bottom sheet */}
      <AnimatePresence>
        {showTimePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowTimePicker(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-card p-6 pb-10"
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-foreground">Set time</h2>
                <button
                  onClick={() => setShowTimePicker(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                    backdropFilter: "blur(40px) saturate(1.8)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  <X className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                </button>
              </div>

              {/* Wheels */}
              <div className="flex items-center gap-2">
                <WheelPicker
                  items={HOURS}
                  value={tempHour}
                  onChange={setTempHour}
                  formatItem={(h) => String(h).padStart(2, "0")}
                />
                <span className="text-2xl font-bold text-muted-foreground">:</span>
                <WheelPicker
                  items={MINUTES}
                  value={tempMinute}
                  onChange={setTempMinute}
                  formatItem={(m) => String(m).padStart(2, "0")}
                />
              </div>

              {/* Apply button */}
              <button
                onClick={applyTime}
                className="mt-6 w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Apply
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default NotificationPreferences;
