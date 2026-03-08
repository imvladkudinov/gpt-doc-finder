import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
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

const CalendarPage = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Plants");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  // Mock events
  const wateringDays = [1, 3, 5, 7, 8, 10, 12, 14, 16, 17, 19, 21, 23, 24, 26, 28, 30];
  const rareDays = [2, 5, 9, 15, 20, 25, 28];
  const eventDays = activeTab === "Plants" ? wateringDays : rareDays;

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
              {/* Weekday headers */}
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

              {/* Days */}
              <div className="grid grid-cols-7 gap-y-1">
                {days.map((day, i) => {
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const hasEvent = inMonth && eventDays.includes(day.getDate());

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day)}
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
    </PageTransition>
  );
};

export default CalendarPage;
