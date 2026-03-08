import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import { mockPlants } from "@/data/mockPlants";
import { getWateringStatus } from "@/lib/plant-utils";
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

// Each day maps to plant names — the count of names = number of dots
const dayPlantMap: Record<number, string[]> = {
  1: ["Monstera", "Pothos"],
  3: ["Boston Fern", "Peace Lily", "Orchid"],
  5: ["Succulent"],
  7: ["Monstera", "ZZ Plant", "Calathea"],
  8: ["Calathea"],
  10: ["Pothos", "Fiddle Leaf"],
  12: ["Boston Fern", "Snake Plant", "Rubber Plant"],
  14: ["Monstera"],
  16: ["Aloe Vera", "Calathea"],
  17: ["Pothos"],
  19: ["Succulent", "ZZ Plant", "Fiddle Leaf"],
  21: ["Monstera", "Boston Fern"],
  23: ["Peace Lily"],
  24: ["Calathea", "Orchid", "Aloe Vera"],
  26: ["Pothos"],
  28: ["Monstera", "Rubber Plant"],
  30: ["Boston Fern", "Succulent"],
};

const rareActivitiesMap: Record<number, { name: string; emoji: string; task: string }[]> = {
  14: [{ name: "Monstera", emoji: "🪴", task: "Replanting" }],
};

function getEventCount(dayNum: number, tab: (typeof TABS)[number]): number {
  if (tab === "Plants") return (dayPlantMap[dayNum] ?? []).length;
  return (rareActivitiesMap[dayNum] ?? []).length;
}

function hasEvents(dayNum: number, tab: (typeof TABS)[number]): boolean {
  return getEventCount(dayNum, tab) > 0;
}

const CalendarPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Plants");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [sheetDate, setSheetDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleDayClick = (day: Date) => {
    if (!isSameMonth(day, currentMonth)) return;
    const dayNum = day.getDate();
    if (!hasEvents(dayNum, activeTab)) return;
    setSheetDate(day);
  };

  const sheetDayNum = sheetDate?.getDate() ?? 0;
  const sheetPlants =
    activeTab === "Plants"
      ? (dayPlantMap[sheetDayNum] ?? []).map((name) => {
          const plant = mockPlants.find((p) => p.name === name);
          return plant ?? { id: name, name, emoji: "🌿" };
        })
      : [];
  const sheetRare = activeTab === "Rare activities" ? (rareActivitiesMap[sheetDayNum] ?? []) : [];

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
                        background: "linear-gradient(135deg, rgba(70,120,75,0.5) 0%, rgba(70,120,75,0.25) 100%)",
                        backdropFilter: "blur(40px) saturate(1.8)",
                        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                        border: "1px solid rgba(70,120,75,0.5)",
                        boxShadow: "0 4px 20px rgba(70,120,75,0.18), inset 0 1px 0 rgba(255,255,255,0.3)",
                        color: "hsl(var(--foreground))",
                        fontWeight: 600,
                      }
                    : {
                        background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                        backdropFilter: "blur(40px) saturate(1.8)",
                        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                        border: "1px solid rgba(255,255,255,0.5)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                        color: "hsl(var(--foreground))",
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
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card transition-colors active:bg-secondary"
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <h2 className="font-serif text-base font-semibold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card transition-colors active:bg-secondary"
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
                  const selected = false;
                  const dayNum = day.getDate();
                  const eventCount = inMonth ? getEventCount(dayNum, activeTab) : 0;
                  const clickable = inMonth && eventCount > 0;
                  const dotCount = Math.min(eventCount, 3);

                  return (
                    <button
                      key={i}
                      onClick={() => clickable && handleDayClick(day)}
                      className={`relative flex h-10 w-full items-center justify-center rounded-xl text-sm transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground font-semibold"
                          : today
                          ? "bg-sage-100 text-primary font-semibold"
                          : inMonth && clickable
                          ? "text-foreground hover:bg-secondary cursor-pointer"
                          : inMonth
                          ? "text-foreground/50 cursor-default"
                          : "text-muted-foreground/30 cursor-default"
                      }`}
                      disabled={!clickable}
                    >
                      {day.getDate()}
                      {dotCount > 0 && !selected && (
                        <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                          {Array.from({ length: dotCount }).map((_, di) => (
                            <span
                              key={di}
                              className="h-1 w-1 rounded-full bg-primary"
                            />
                          ))}
                        </span>
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
                  <X className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {activeTab === "Plants"
                  ? sheetPlants.map((plant) => {
                      const fullPlant = mockPlants.find((p) => p.id === plant.id);
                      const status = fullPlant ? getWateringStatus(fullPlant) : null;
                      const isOverdue = status?.daysLeft === 0;
                      return (
                        <div
                          key={plant.id}
                          className="relative flex min-h-[140px] flex-col items-start gap-2 rounded-2xl bg-secondary p-3.5 text-left"
                        >
                          {isOverdue && (
                            <div
                              className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full"
                              style={{ background: "hsl(20 70% 60%)", boxShadow: "0 0 8px hsla(20,70%,60%,0.3)" }}
                            />
                          )}
                          <div className="text-4xl">{plant.emoji}</div>
                          <div className="w-full">
                            <h3 className="font-serif text-[15px] font-semibold text-foreground leading-tight line-clamp-2">
                              {plant.name}
                            </h3>
                            <span className="text-[10px] font-medium text-muted-foreground leading-none">
                              {status ? (status.daysLeft === 0 ? "In 0 days" : status.label) : "Water"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  : sheetRare.map((item, i) => (
                      <div
                        key={i}
                        className="relative flex min-h-[140px] flex-col items-start gap-2 rounded-2xl bg-secondary p-3.5 text-left"
                      >
                        <div className="text-4xl">{item.emoji}</div>
                        <div className="w-full">
                          <h3 className="font-serif text-[15px] font-semibold text-foreground leading-tight line-clamp-2">
                            {item.name}
                          </h3>
                          <span className="text-[10px] font-medium text-muted-foreground leading-none">
                            Replant
                          </span>
                        </div>
                      </div>
                    ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default CalendarPage;
