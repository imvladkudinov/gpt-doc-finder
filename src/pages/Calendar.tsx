import { CalendarDays } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const CalendarPage = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="px-6 pt-6 pb-4">
          <h1 className="font-serif text-2xl font-bold text-foreground">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your watering schedule at a glance
          </p>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 rounded-full bg-sage-100 p-4">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-foreground">Coming soon</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Calendar view with notification management is on its way. Your plants will thank you at the time you choose.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default CalendarPage;
