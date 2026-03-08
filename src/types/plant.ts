export interface Plant {
  id: string;
  name: string;
  emoji: string;
  nextWatering: Date;
  wateringInterval: number; // days
  lastWatered: Date;
  missedWatering: boolean;
  notes: string;
  replantingInterval: number; // months
  nextReplanting: Date;
  autoSchedule: boolean;
}
