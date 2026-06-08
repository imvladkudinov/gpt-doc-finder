import { describe, it, expect } from "vitest";
import { getWateringStatus, getReplantStatus } from "@/lib/plant-utils";
import type { Plant } from "@/types/plant";

const DAY = 24 * 60 * 60 * 1000;

const buildPlant = (overrides: Partial<Plant> = {}): Plant => ({
  id: "p1",
  name: "Test Plant",
  emoji: "🌿",
  nextWatering: new Date(Date.now() + 7 * DAY),
  wateringInterval: 7,
  lastWatered: new Date(),
  lastReplanted: new Date(),
  missedWatering: false,
  notes: "",
  replantingInterval: 12,
  nextReplanting: new Date(),
  autoSchedule: false,
  ...overrides,
});

describe("getWateringStatus", () => {
  it("is urgent when watering was missed, even if the next date is in the future", () => {
    const status = getWateringStatus(
      buildPlant({ missedWatering: true, nextWatering: new Date(Date.now() + 5 * DAY) }),
    );
    expect(status.urgent).toBe(true);
    expect(status.daysLeft).toBe(0);
    expect(status.label).toBe("water me");
  });

  it("is urgent when the next watering date is in the past", () => {
    const status = getWateringStatus(buildPlant({ nextWatering: new Date(Date.now() - DAY) }));
    expect(status.urgent).toBe(true);
    expect(status.daysLeft).toBe(0);
  });

  it("is urgent when watering is due today", () => {
    const status = getWateringStatus(buildPlant({ nextWatering: new Date() }));
    expect(status.urgent).toBe(true);
  });

  it("says 'tomorrow' when due in one day", () => {
    const status = getWateringStatus(buildPlant({ nextWatering: new Date(Date.now() + DAY) }));
    expect(status.urgent).toBe(false);
    expect(status.daysLeft).toBe(1);
    expect(status.label).toBe("tomorrow");
  });

  it("reports the day count when due in several days", () => {
    const status = getWateringStatus(buildPlant({ nextWatering: new Date(Date.now() + 3 * DAY) }));
    expect(status.urgent).toBe(false);
    expect(status.daysLeft).toBe(3);
    expect(status.label).toBe("in 3 days");
  });
});

describe("getReplantStatus", () => {
  it("is due when the interval has fully elapsed", () => {
    const status = getReplantStatus(
      buildPlant({ lastReplanted: new Date(Date.now() - 400 * DAY), replantingInterval: 1 }),
    );
    expect(status.due).toBe(true);
    expect(status.monthsLeft).toBe(0);
    expect(status.label).toBe("Replanted");
  });

  it("reports months remaining when not yet due", () => {
    const status = getReplantStatus(buildPlant({ lastReplanted: new Date(), replantingInterval: 12 }));
    expect(status.due).toBe(false);
    expect(status.monthsLeft).toBe(12);
    expect(status.label).toBe("12 months left");
  });

  it("uses singular 'month' when one month remains", () => {
    const status = getReplantStatus(buildPlant({ lastReplanted: new Date(), replantingInterval: 1 }));
    expect(status.due).toBe(false);
    expect(status.monthsLeft).toBe(1);
    expect(status.label).toBe("1 month left");
  });

  it("treats a missing lastReplanted as 'now' (not due)", () => {
    const status = getReplantStatus(buildPlant({ lastReplanted: undefined, replantingInterval: 6 }));
    expect(status.due).toBe(false);
  });
});
