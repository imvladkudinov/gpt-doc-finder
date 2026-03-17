import { addMonths, format, isToday, isBefore, startOfDay } from "date-fns";
import { Plant } from "@/types/plant";

export function getWateringStatus(plant: Plant) {
  const now = new Date();
  const next = new Date(plant.nextWatering);
  const todayStart = startOfDay(now);

  if (isToday(next)) {
    return { label: "today", urgent: false, color: "muted" as const, daysLeft: 0 };
  }

  if (plant.missedWatering || isBefore(next, todayStart)) {
    return { label: "water me", urgent: true, color: "warning" as const, daysLeft: 0 };
  }

  const msLeft = next.getTime() - now.getTime();
  const days = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

  return {
    label: days === 1 ? "tomorrow" : `in ${days} days`,
    urgent: false,
    color: "primary" as const,
    daysLeft: days,
  };
}

export function formatWateringDate(date: Date) {
  return format(new Date(date), "MMM d");
}

export function getReplantStatus(plant: Plant) {
  const now = new Date();
  const lastReplanted = plant.lastReplanted ? new Date(plant.lastReplanted) : now;
  const dueAtDayStart = startOfDay(addMonths(startOfDay(lastReplanted), plant.replantingInterval));

  if (now >= dueAtDayStart) {
    return { due: true, monthsLeft: 0, label: "Replanted" };
  }

  const msLeft = dueAtDayStart.getTime() - now.getTime();
  const monthsLeft = Math.max(0, Math.round(msLeft / (1000 * 60 * 60 * 24 * 30.4375)));

  return {
    due: false,
    monthsLeft,
    label: monthsLeft === 1 ? "1 month left" : `${monthsLeft} months left`,
  };
}
