import { addMonths, isToday, isBefore, startOfDay } from "date-fns";
import { Plant } from "@/types/plant";

export function getWateringStatus(plant: Plant) {
  const now = new Date();
  const next = new Date(plant.nextWatering);
  const todayStart = startOfDay(now);

  if (plant.missedWatering || isBefore(next, todayStart) || isToday(next)) {
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

export function getSprayStatus(lastSprayedDate: string | null, intervalDays: number) {
  if (!lastSprayedDate) {
    return { label: "spray me", urgent: true, daysLeft: 0 };
  }

  const now = new Date();
  const due = startOfDay(new Date(lastSprayedDate));
  due.setDate(due.getDate() + intervalDays);

  if (now >= due) {
    return { label: "spray me", urgent: true, daysLeft: 0 };
  }

  const msLeft = due.getTime() - now.getTime();
  const days = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

  return {
    label: days === 1 ? "tomorrow" : `in ${days} days`,
    urgent: false,
    daysLeft: days,
  };
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
