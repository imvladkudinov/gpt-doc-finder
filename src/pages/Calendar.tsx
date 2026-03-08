import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Droplets } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import { mockPlants } from "@/data/mockPlants";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";

const TABS = ["Plants", "Rare activities"] as const;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Map day numbers to plant subsets for demo
const dayPlantMap: Record<number, string[]> = {
  1: ["Monstera", "Pothos"],
  3: ["Boston Fern", "Peace Lily"],
  5: ["Succulent", "Aloe Vera", "Orchid"],
  7: ["Monstera", "ZZ Plant"],
  8: ["Calathea", "Rubber Plant"],
  10: ["Pothos", "Fiddle Leaf"],
  12: ["Boston Fern", "Snake Plant"],
  14: ["Monstera", "Peace Lily", "Orchid"],
  16: ["Aloe Vera", "Calathea"],
  17: ["Pothos", "Rubber Plant"],
  19: ["Succulent", "ZZ Plant"],
  21: ["Monstera", "Boston Fern", "Fiddle Leaf"],
  23: ["Peace Lily", "Snake Plant"],
  24: ["Calathea", "Orchid"],
  26: ["Pothos", "Aloe Vera"],
  28: ["Monstera", "Rubber Plant", "ZZ Plant"],
  30: ["Boston Fern", "Succulent"],
};

const rareActivitiesMap: Record<number, { name: string; emoji: string; task: string }[]> = {
  2: [{ name: "Monstera", emoji: "🪴", task: "Repotting" }],
  5: [{ name: "Orchid", emoji: "🌸", task: "Fertilizing" }],
  9: [{ name: "Fiddle Leaf", emoji: "🌳", task: "Pruning" }],
  15: [{ name: "Peace Lily", emoji: "🪷", task: "Fertilizing" }, { name: "Calathea", emoji: "🍃", task: "Repotting" }],
  20: [{ name: "Snake Plant", emoji: "🐍", task: "Repotting" }],
  25: [{ name: "Aloe Vera", emoji: "🪴", task: "Fertilizing" }],
  28: [{ name: "Rubber Plant", emoji: "🌱", task: "Pruning" }],
};

const CalendarPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Plants");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sheetDate, setSheetDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const wateringDays = Object.keys(dayPlantMap).map(Number);
  const rareDays = Object.keys(rareActivitiesMap).map(Number);
  const eventDays = activeTab === "Plants" ? wateringDays : rareDays;

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    if (isSameMonth(day, currentMonth)) {
      setSheetDate(day);
    }
  };

  // Get plants for the sheet
  const sheetDayNum = sheetDate?.getDate() ?? 0;
  const sheetPlants =
    activeTab === "Plants"
      ? (dayPlantMap[sheetDayNum] ?? []).map((name) => {
          const plant = mockPlants.find((p) => p.name === name);
          return plant ?? { id: name, name, emoji: "🌿" };
        })
      : [];
  const sheetRare = activeTab === "Rare activities" ? (rareActivitiesMap[sheetDayNum] ?? []) : [];
  const hasSheetContent = activeTab === "Plants" ? sheetPlants.length > 0 : sheetRare.length > 0;

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="px-6 pt-6 pb-4">
            <h1 className="font-serif text-2xl font-bold text-foreground">Calendar</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-6 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="rounded-full px-5 py-2.5 text-sm font-medium transition-all"
                style={
                  activeTab === tab
                    ? {
                        background: "linear-gradient(135deg, rgba(104,159,107,0.35) 0%, rgba(104,159,107,0.18) 100%)",
                        backdropFilter: "blur(40px) saturate(1.8)",
                        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                        border: "1px solid rgba(104,159,107,0.4)",
                        boxShadow: "0 4px 16px rgba(104,159,107,0.12), inset 0 1px 0 rgba(255,255,255,0.3)",
                        color: "hsl(var(--sage-700))",
                      }
                    : {
                        background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.25) 100%)",
                        backdropFilter: "blur(40px) saturate(1.8)",
                        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                        border: "1px solid rgba(255,255,255,0.5)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
                        color: "hsl(var(--muted-foreground))",
                      }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between px-6 mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card transition-colors hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <h2 className="font-serif text-base font-semibold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card transition-colors hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="px-6">
            <div className="rounded-2xl bg-card p-4">
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {days.map((day, i) => {
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const hasEvent = inMonth && eventDays.includes(day.getDate());

                  return (
                    <button
                      key={i}
                      onClick={() => handleDayClick(day)}
                      className={`relative flex h-10 w-full items-center justify-center rounded-xl text-sm transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground font-semibold"
                          : today
                          ? "bg-sage-100 text-primary font-semibold"
                          : inMonth
                          ? "text-foreground hover:bg-secondary"
                          : "text-muted-foreground/30"
                      }`}
                    >
                      {day.getDate()}
                      {hasEvent && !selected && (
                        <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </ScrollFadeLayout>

      {/* Day detail bottom sheet */}
      <AnimatePresence>
        {sheetDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSheetDate(null)}
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
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-foreground">
                  {format(sheetDate, "EEEE, MMM d")}
                </h2>
                <button
                  onClick={() => setSheetDate(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                    backdropFilter: "blur(40px) saturate(1.8)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  <X className="h-[18px] w-[18px] text-foreground/55" strokeWidth={2.5} />
                </button>
              </div>

              {/* Plant tiles */}
              {hasSheetContent ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {activeTab === "Plants"
                    ? sheetPlants.map((plant) => (
                        <div
                          key={plant.id}
                          className="flex min-h-[120px] flex-col items-start gap-2 rounded-2xl bg-background p-3.5 text-left"
                        >
                          <div className="text-2xl">{plant.emoji}</div>
                          <div className="w-full">
                            <h3 className="font-serif text-xs font-semibold text-foreground leading-tight truncate">
                              {plant.name}
                            </h3>
                            <div className="mt-1.5 flex items-center gap-1">
                              <Droplets className="h-3 w-3 text-primary" />
                              <span className="text-[10px] font-medium text-muted-foreground">
                                Water
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    : sheetRare.map((item, i) => (
                        <div
                          key={i}
                          className="flex min-h-[120px] flex-col items-start gap-2 rounded-2xl bg-background p-3.5 text-left"
                        >
                          <div className="text-2xl">{item.emoji}</div>
                          <div className="w-full">
                            <h3 className="font-serif text-xs font-semibold text-foreground leading-tight truncate">
                              {item.name}
                            </h3>
                            <div className="mt-1.5">
                              <span className="text-[10px] font-medium text-accent">
                                {item.task}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No {activeTab === "Plants" ? "watering" : "activities"} scheduled
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default CalendarPage;
