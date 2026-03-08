import { format, isToday, isBefore, differenceInDays } from "date-fns";
import { Plant } from "@/types/plant";

export function getWateringStatus(plant: Plant) {
  const now = new Date();
  const next = new Date(plant.nextWatering);

  if (plant.missedWatering || isBefore(next, now)) {
    return { label: "Needs water!", urgent: true, color: "terracotta" as const };
  }
  if (isToday(next)) {
    return { label: "Water today", urgent: false, color: "accent" as const };
  }
  const days = differenceInDays(next, now);
  return {
    label: days === 1 ? "Tomorrow" : `In ${days} days`,
    urgent: false,
    color: "primary" as const,
  };
}

export function formatWateringDate(date: Date) {
  return format(new Date(date), "MMM d");
}
