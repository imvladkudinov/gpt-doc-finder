import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconPlusFilled,
  IconXFilled,
  IconDropletFilled,
  IconSparklesFilled,
  IconCalendarWeekFilled,
  IconPencilFilled,
} from "@tabler/icons-react";
import { ChevronsUpDown } from "lucide-react";

import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import PlantCard from "@/components/PlantCard";
import AddPlantDialog from "@/components/AddPlantDialog";
import { ListCell } from "@/components/ui/ListCell";
import { ButtonLow } from "@/components/ui/ButtonLow";

import { supabase } from "@/integrations/supabase/client";
import { Plant } from "@/types/plant";
import { getReplantStatus, getWateringStatus } from "@/lib/plant-utils";
import { getPlantInfo } from "@/lib/plant-info";
import { ensureActiveHomeForCurrentUser, getActiveHomeId, setActiveHomeId } from "@/lib/homes";
import { appToast } from "@/lib/app-toast";

type HomeRow = {
  id: string;
  name: string;
};

type MembershipRow = {
  home_id: string;
  homes: HomeRow | HomeRow[] | null;
};

interface PlantRow {
  id: string;
  name: string;
  watering_interval: number;
  last_watered: string;
  replanting_interval: number;
  last_replanted: string;
}

const mapPlantRow = (p: PlantRow): Plant => {
  const lastWatered = new Date(p.last_watered);
  const lastReplanted = new Date(p.last_replanted);
  return {
    id: p.id,
    name: p.name,
    emoji: "🌿",
    wateringInterval: p.watering_interval,
    lastWatered,
    lastReplanted,
    replantingInterval: p.replanting_interval,
    nextWatering: new Date(lastWatered.getTime() + p.watering_interval * 24 * 60 * 60 * 1000),
    nextReplanting: new Date(lastReplanted.getTime() + p.replanting_interval * 30 * 24 * 60 * 60 * 1000),
    missedWatering: false,
    notes: "",
    autoSchedule: false,
  };
};

const glassAction = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
  backdropFilter: "blur(40px) saturate(1.8)",
  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.5)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
};

const PagePlants = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [isTopBarVisible, setIsTopBarVisible] = useState(false);
  const [homes, setHomes] = useState<HomeRow[]>([]);
  const [activeHomeId, setActiveHomeIdState] = useState<string | null>(getActiveHomeId());
  const hasTopBarAnimated = useRef(false);

  const activeHomeName = homes.find((home) => home.id === activeHomeId)?.name ?? "";
  const plantsCounterText = `${plants.length} plants`;

  const loadHomes = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      setHomes([]);
      setActiveHomeIdState(null);
      return null;
    }

    let { data: membershipsData, error: membershipsError } = await supabase
      .from("home_members")
      .select("home_id,homes(id,name)")
      .eq("user_id", userId)
      .order("joined_at", { ascending: true });

    if (!membershipsData || membershipsData.length === 0) {
      const ensuredHomeId = await ensureActiveHomeForCurrentUser();
      if (ensuredHomeId) {
        const refetch = await supabase
          .from("home_members")
          .select("home_id,homes(id,name)")
          .eq("user_id", userId)
          .order("joined_at", { ascending: true });

        membershipsData = refetch.data;
        membershipsError = refetch.error;
      }
    }

    if (membershipsError) {
      setHomes([]);
      setActiveHomeIdState(null);
      return null;
    }

    const memberships = (membershipsData ?? []) as MembershipRow[];
    const nextHomes = memberships
      .map((item) => {
        const relation = item.homes;
        const home = Array.isArray(relation) ? relation[0] : relation;
        return home ?? null;
      })
      .filter((home): home is HomeRow => Boolean(home));

    setHomes(nextHomes);

    if (nextHomes.length === 0) {
      setActiveHomeIdState(null);
      return null;
    }

    const stored = getActiveHomeId();
    const resolvedActive = stored && nextHomes.some((home) => home.id === stored)
      ? stored
      : nextHomes[0].id;

    setActiveHomeId(resolvedActive);
    setActiveHomeIdState(resolvedActive);

    return resolvedActive;
  };

  const loadPlantsForHome = async (
    homeId: string,
    { initial = false }: { initial?: boolean } = {},
  ) => {
    if (initial) {
      setIsLoadingPlants(true);
    }

    const { data, error } = await supabase.rpc("get_current_user_plants_for_home", {
      default_home_name: "My home",
      target_home_id: homeId,
    });

    if (error) {
      if (initial) {
        setIsLoadingPlants(false);
      }
      return;
    }

    setPlants(((data ?? []) as PlantRow[]).map(mapPlantRow));
    if (initial) {
      setIsLoadingPlants(false);
    }
  };

  // Fetch plants from Supabase on mount
  useEffect(() => {
    const bootstrap = async () => {
      const resolvedHomeId = await loadHomes();
      if (!resolvedHomeId) {
        setIsLoadingPlants(false);
        return;
      }
      await loadPlantsForHome(resolvedHomeId, { initial: true });
    };

    bootstrap();

    return () => {
      if (savePlantNameTimeout.current) {
        window.clearTimeout(savePlantNameTimeout.current);
      }
    };
  }, []);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [overduePlant, setOverduePlant] = useState<Plant | null>(null);
  const [showPlantInfo, setShowPlantInfo] = useState(false);
  const [pendingReplantInterval, setPendingReplantInterval] = useState<number | null>(null);
  const [showReplantChangeConfirm, setShowReplantChangeConfirm] = useState(false);

  // Removed lateWaterPlant logic
  const savePlantNameTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (isLoadingPlants || hasTopBarAnimated.current) return;

    hasTopBarAnimated.current = true;
    window.requestAnimationFrame(() => {
      setIsTopBarVisible(true);
    });
  }, [isLoadingPlants]);

  const handleWater = async (id: string) => {
    // Update last_watered in Supabase
    const { error } = await supabase
      .from("plants")
      .update({ last_watered: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      appToast.error("Water update failed");
      return;
    }
    // Refetch plants
    if (!activeHomeId) return;
    await loadPlantsForHome(activeHomeId);
    appToast.success("Watered");
  };

  // Always water on click, no modal or urgent check
  const handleWaterWithCheck = (id: string) => {
    handleWater(id);
  };

  const handleAddPlant = async (_name: string, _interval: number) => {
    if (!activeHomeId) return;
    await loadPlantsForHome(activeHomeId);
    // Optionally handle error
  };

  const handlePlantNameChange = (nextName: string) => {
    if (!selectedPlant) return;

    const plantId = selectedPlant.id;
    setSelectedPlant((prev) => (prev ? { ...prev, name: nextName } : prev));
    setPlants((prev) => prev.map((plant) => (plant.id === plantId ? { ...plant, name: nextName } : plant)));

    if (savePlantNameTimeout.current) {
      window.clearTimeout(savePlantNameTimeout.current);
    }

    savePlantNameTimeout.current = window.setTimeout(async () => {
      const trimmed = nextName.trim();
      if (!trimmed) return;

      await supabase.from("plants").update({ name: trimmed }).eq("id", plantId);

      setSelectedPlant((prev) => (prev && prev.id === plantId ? { ...prev, name: trimmed } : prev));
      setPlants((prev) => prev.map((plant) => (plant.id === plantId ? { ...plant, name: trimmed } : plant)));
    }, 350);
  };

  const handleActiveHomeChange = async (nextHomeId: string) => {
    setActiveHomeId(nextHomeId);
    setActiveHomeIdState(nextHomeId);
    setSelectedPlant(null);
    setOverduePlant(null);
    setLateWaterPlant(null);
    await loadPlantsForHome(nextHomeId, { initial: true });
  };

  const REPLANTING_OPTIONS = Array.from({ length: 12 }, (_, i) => 3 + i * 3);

  const restartReplantCounter = async (plantId: string) => {
    const nowIso = new Date().toISOString();
    const { error } = await supabase.from("plants").update({ last_replanted: nowIso }).eq("id", plantId);
    if (error) {
      appToast.error("Something went wrong");
      return;
    }

    setSelectedPlant((prev) => {
      if (!prev || prev.id !== plantId) return prev;
      const now = new Date(nowIso);
      return {
        ...prev,
        lastReplanted: now,
        nextReplanting: new Date(now.getTime() + prev.replantingInterval * 30 * 24 * 60 * 60 * 1000),
      };
    });

    setPlants((prev) =>
      prev.map((plant) => {
        if (plant.id !== plantId) return plant;
        const now = new Date(nowIso);
        return {
          ...plant,
          lastReplanted: now,
          nextReplanting: new Date(now.getTime() + plant.replantingInterval * 30 * 24 * 60 * 60 * 1000),
        };
      }),
    );

    appToast.success("Update applied");
  };

  const confirmReplantIntervalChange = async () => {
    if (!selectedPlant || pendingReplantInterval === null) {
      setShowReplantChangeConfirm(false);
      return;
    }

    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("plants")
      .update({ replanting_interval: pendingReplantInterval, last_replanted: nowIso })
      .eq("id", selectedPlant.id);
    if (error) {
      appToast.error("Replant interval failed");
      return;
    }

    setSelectedPlant((prev) => {
      if (!prev) return prev;
      const now = new Date(nowIso);
      return {
        ...prev,
        replantingInterval: pendingReplantInterval,
        lastReplanted: now,
        nextReplanting: new Date(now.getTime() + pendingReplantInterval * 30 * 24 * 60 * 60 * 1000),
      };
    });

    setPlants((prev) =>
      prev.map((plant) => {
        if (plant.id !== selectedPlant.id) return plant;
        const now = new Date(nowIso);
        return {
          ...plant,
          replantingInterval: pendingReplantInterval,
          lastReplanted: now,
          nextReplanting: new Date(now.getTime() + pendingReplantInterval * 30 * 24 * 60 * 60 * 1000),
        };
      }),
    );

    setPendingReplantInterval(null);
    setShowReplantChangeConfirm(false);
    appToast.success("Replant interval saved");
  };



  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24 flex flex-col">
          {plants.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isTopBarVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="fixed top-6 right-6 z-40"
            >
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                style={glassAction}
                aria-label="Add plant"
              >
                <IconPlusFilled className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
              </button>
            </motion.div>
          ) : null}

          {/* Header */}
          <div className="pl-6 pr-[76px] pt-6 pb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHomeId ?? "no-home"}
                initial={{ opacity: 0, y: 10 }}
                animate={isTopBarVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="relative flex max-w-full items-center gap-1">
                  <div className="flex min-w-0 items-center gap-1">
                    {activeHomeName ? (
                      <>
                        <h1 className="max-w-full truncate whitespace-nowrap font-serif text-[30px] font-bold text-foreground">
                          {activeHomeName}
                        </h1>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </>
                    ) : null}
                  </div>
                  <select
                    value={activeHomeId ?? ""}
                    onChange={(e) => {
                      const nextHomeId = e.target.value;
                      if (!nextHomeId || nextHomeId === activeHomeId) return;
                      handleActiveHomeChange(nextHomeId);
                    }}
                    className="absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
                  >
                    {homes.map((home) => (
                      <option key={home.id} value={home.id}>
                        {home.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-0 h-5 text-sm text-muted-foreground">
                  <p className="text-sm leading-tight text-muted-foreground">{isLoadingPlants ? "" : plantsCounterText}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Info tabs */}
          </div>

          {/* Empty state */}
          {!isLoadingPlants && plants.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <h2 className="font-serif text-[22px] font-bold text-foreground mb-2 text-center">
                No plants added
              </h2>
              <p className="text-sm text-muted-foreground mb-3 text-center">
                Add your first plant to track and let them live
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg mb-2"
                style={{ fontSize: 24 }}
              >
                <IconPlusFilled className="h-6 w-6" />
              </button>
            </div>
          ) : plants.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-1 px-6">
              {plants
                .slice()
                .sort((a, b) => {
                  const aStatus = getWateringStatus(a);
                  const bStatus = getWateringStatus(b);
                  // 1. Due plants (urgent or today) on top
                  const aDue = aStatus.urgent || aStatus.daysLeft === 0;
                  const bDue = bStatus.urgent || bStatus.daysLeft === 0;
                  if (aDue && !bDue) return -1;
                  if (!aDue && bDue) return 1;
                  // 2. By days left (soonest first)
                  if (aStatus.daysLeft !== bStatus.daysLeft) {
                    return aStatus.daysLeft - bStatus.daysLeft;
                  }
                  // 3. Alphabetically
                  return a.name.localeCompare(b.name);
                })
                .map((plant, i) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    index={i}
                    onClick={() => setSelectedPlant(plant)}
                    onOverdueClick={() => setOverduePlant(plant)}
                    onWater={() => handleWaterWithCheck(plant.id)}
                  />
                ))}
            </div>
          ) : null}

      {/* Bottom sheet detail */}
      <AnimatePresence>
        {selectedPlant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 right-0 z-50 flex items-end justify-center bg-[var(--background-overlay)] backdrop-blur-sm"
            style={{
              top: 'calc(0px - env(safe-area-inset-top, 0px))',
              height: 'calc(100vh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
            onClick={() => setSelectedPlant(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="mb-2 w-[calc(100%-16px)] max-w-md rounded-b-[58px] rounded-t-[50px] p-6 pb-10"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                backdropFilter: "blur(40px) saturate(1.8)",
                WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-[22px] font-bold text-foreground">
                  {selectedPlant.name}
                </h2>
                <div className="flex items-center gap-2">
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedPlant(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                      backdropFilter: "blur(40px) saturate(1.8)",
                      WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                      border: "1px solid rgba(255,255,255,0.5)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                    }}
                  >
                    <IconXFilled className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <ListCell
                className="mb-1"
                icon={<IconPencilFilled className="h-6 w-6 shrink-0 text-primary" />}
                title="Plant name"
                right={{ type: "input", value: selectedPlant.name, onChange: handlePlantNameChange }}
              />

              {/* Watering interval row */}
              <ListCell
                className="mb-1"
                icon={<IconDropletFilled className="h-6 w-6 shrink-0 text-primary" />}
                title="Watering interval"
                right={{
                  type: "select",
                  options: [1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,24,28,32,36,40,48,56,64].map((v) => ({ value: v, label: `${v} days` })),
                  value: selectedPlant.wateringInterval,
                  displayValue: `${selectedPlant.wateringInterval} days`,
                  onChange: async (v) => {
                    const val = Number(v);
                    const previous = selectedPlant.wateringInterval;
                    const updated = { ...selectedPlant, wateringInterval: val };
                    setSelectedPlant(updated);
                    setPlants((prev) => prev.map((p) => p.id === updated.id ? updated : p));
                    const { error } = await supabase
                      .from("plants")
                      .update({ watering_interval: val })
                      .eq("id", selectedPlant.id);

                    if (error) {
                      const reverted = { ...selectedPlant, wateringInterval: previous };
                      setSelectedPlant(reverted);
                      setPlants((prev) => prev.map((p) => p.id === reverted.id ? reverted : p));
                      appToast.error("Something went wrong");
                      return;
                    }

                    appToast.success("Watering interval saved");
                  },
                }}
              />

              {/* Replant in row */}
              {(() => {
                const replant = getReplantStatus(selectedPlant);

                if (replant.due) {
                  return (
                    <ListCell
                      className="mb-1"
                      icon={<IconCalendarWeekFilled className="h-5 w-5 shrink-0 text-primary" />}
                      title="Replant in"
                      right={{ type: "button-low", label: "Replanted", variant: "primary", onPress: () => restartReplantCounter(selectedPlant.id) }}
                    />
                  );
                }

                return (
                  <ListCell
                    className="mb-1"
                    icon={<IconCalendarWeekFilled className="h-6 w-6 shrink-0 text-primary" />}
                    title="Replant in"
                    right={{
                      type: "select",
                      options: REPLANTING_OPTIONS.map((v) => ({ value: v, label: `${v} months` })),
                      value: selectedPlant.replantingInterval,
                      displayValue: replant.label,
                      onChange: (v) => {
                        const next = Number(v);
                        if (next === selectedPlant.replantingInterval) return;
                        setPendingReplantInterval(next);
                        setShowReplantChangeConfirm(true);
                      },
                    }}
                  />
                );
              })()}

              {/* Auto schedule toggle */}
        
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Add dialog */}
      <AnimatePresence>
        {showAdd && (
          <AddPlantDialog
            open={showAdd}
            onClose={() => setShowAdd(false)}
            onAdd={handleAddPlant}
          />
        )}
      </AnimatePresence>

      {/* Overdue modal */}
      <AnimatePresence>
        {overduePlant && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 z-[70] bg-black/40"
              style={{
                top: 'calc(0px - env(safe-area-inset-top, 0px))',
                height: 'calc(100vh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
              }}
              onClick={() => setOverduePlant(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="fixed inset-0 z-[70] m-auto flex h-fit w-[85%] max-w-xs flex-col rounded-b-[46px] rounded-t-[38px] p-7"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                backdropFilter: "blur(40px) saturate(1.8)",
                WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <p className="text-3xl mb-2">{overduePlant.emoji}</p>
              <p className="text-base font-medium text-foreground mb-5">
                Was it watered earlier and you forgot to mark it?
              </p>
              <div className="flex justify-start gap-2">
                <ButtonLow
                  variant="secondary"
                  onClick={() => {
                    handleWater(overduePlant.id);
                    setOverduePlant(null);
                  }}
                >
                  Already watered
                </ButtonLow>
                <ButtonLow
                  variant="secondary"
                  onClick={() => {
                    handleWater(overduePlant.id);
                    setOverduePlant(null);
                  }}
                >
                  Water now
                </ButtonLow>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Late watering modal removed: always water and show toast */}

      {/* Replant change confirm modal */}
      <AnimatePresence>
        {showReplantChangeConfirm && selectedPlant && pendingReplantInterval !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 z-[70] bg-black/40"
              style={{
                top: 'calc(0px - env(safe-area-inset-top, 0px))',
                height: 'calc(100vh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
              }}
              onClick={() => {
                setShowReplantChangeConfirm(false);
                setPendingReplantInterval(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="fixed inset-0 z-[70] m-auto flex h-fit w-[85%] max-w-xs flex-col rounded-b-[38px] rounded-t-[30px] p-7"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                backdropFilter: "blur(40px) saturate(1.8)",
                WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <p className="text-base font-medium text-foreground mb-5">
                Change value and restart counter from scratch?
              </p>
              <div className="flex justify-start gap-2">
                <ButtonLow
                  variant="secondary"
                  onClick={() => {
                    setShowReplantChangeConfirm(false);
                    setPendingReplantInterval(null);
                  }}
                >
                  Cancel
                </ButtonLow>
                <ButtonLow
                  variant="primary"
                  onClick={confirmReplantIntervalChange}
                >
                  Confirm
                </ButtonLow>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>

    {/* Plant Info Bottom Sheet */}
    

    {/* Wiki Sheet */}
    

    </ScrollFadeLayout>
    </PageTransition>
  );
};

export default PagePlants;
