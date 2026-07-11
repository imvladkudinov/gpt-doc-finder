import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconPlusFilled,
  IconXFilled,
  IconDropletFilled,
  IconDropletsFilled,
  IconCalendarWeekFilled,
  IconPencilFilled,
  IconCheckFilled,
} from "@tabler/icons-react";
import { ChevronsUpDown } from "lucide-react";

import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import ComponentBottomSheet from "@/components/ComponentBottomSheet";
import PlantCard from "@/components/PlantCard";
import AddPlantDialog from "@/components/AddPlantDialog";
import { ListCell } from "@/components/ui/ListCell";
import { ButtonLow } from "@/components/ui/ButtonLow";

import { supabase } from "@/integrations/supabase/client";
import { Plant } from "@/types/plant";
import { getReplantStatus, getWateringStatus, getSprayStatus } from "@/lib/plant-utils";
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

const REPLANTING_OPTIONS = Array.from({ length: 12 }, (_, i) => 3 + i * 3);

const PagePlants = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [isTopBarVisible, setIsTopBarVisible] = useState(false);
  const [homes, setHomes] = useState<HomeRow[]>([]);
  const [activeHomeId, setActiveHomeIdState] = useState<string | null>(getActiveHomeId());
  const [sprayPrefs, setSprayPrefs] = useState<{ enabled: boolean; intervalDays: number; lastSprayedDate: string | null } | null>(null);
  const hasTopBarAnimated = useRef(false);

  const sprayStatus = useMemo(() => {
    if (!sprayPrefs) return null;
    return getSprayStatus(sprayPrefs.lastSprayedDate, sprayPrefs.intervalDays);
  }, [sprayPrefs]);

  const activeHomeName = homes.find((home) => home.id === activeHomeId)?.name ?? "";
  const plantsCounterText = `${plants.length} plants`;

  const plantStatusCache = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof getWateringStatus>>();
    plants.forEach((plant) => {
      cache.set(plant.id, getWateringStatus(plant));
    });
    return cache;
  }, [plants]);

  const sortedPlants = useMemo(() => {
    const scored = plants.map((plant) => {
      const status = plantStatusCache.get(plant.id) || getWateringStatus(plant);
      return {
        plant,
        due: status.urgent || status.daysLeft === 0,
        daysLeft: status.daysLeft,
      };
    });

    scored.sort((a, b) => {
      if (a.due && !b.due) return -1;
      if (!a.due && b.due) return 1;

      if (a.daysLeft !== b.daysLeft) {
        return a.daysLeft - b.daysLeft;
      }

      return a.plant.name.localeCompare(b.plant.name);
    });

    return scored.map((item) => item.plant);
  }, [plants, plantStatusCache]);

  const plantById = useMemo(() => {
    return new Map(plants.map((plant) => [plant.id, plant]));
  }, [plants]);

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

  const loadPlantsForHome = useCallback(async (
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
  }, []);

  const loadSprayPrefsForHome = useCallback(async (homeId: string) => {
    const { data, error } = await supabase
      .from("home_spray_preferences")
      .select("enabled,interval_days,last_sprayed_date")
      .eq("home_id", homeId)
      .maybeSingle();

    if (error || !data) {
      setSprayPrefs({ enabled: false, intervalDays: 7, lastSprayedDate: null });
      return;
    }

    setSprayPrefs({
      enabled: Boolean(data.enabled),
      intervalDays: Number(data.interval_days),
      lastSprayedDate: data.last_sprayed_date,
    });
  }, []);

  // Fetch plants from Supabase on mount (parallelize homes + plants load)
  useEffect(() => {
    const bootstrap = async () => {
      const storedHomeId = getActiveHomeId();

      // Load homes, plants, and spray prefs in parallel for faster initial load
      const [resolvedHomeId] = await Promise.all([
        loadHomes(),
        storedHomeId ? loadPlantsForHome(storedHomeId, { initial: true }) : Promise.resolve(),
        storedHomeId ? loadSprayPrefsForHome(storedHomeId) : Promise.resolve(),
      ]);

      // If homes finished with a different ID than stored, reload data for that home
      if (resolvedHomeId && resolvedHomeId !== storedHomeId) {
        await Promise.all([
          loadPlantsForHome(resolvedHomeId, { initial: false }),
          loadSprayPrefsForHome(resolvedHomeId),
        ]);
      }

      if (!resolvedHomeId) {
        setIsLoadingPlants(false);
      }
    };

    bootstrap();

    return () => {
      if (savePlantNameTimeout.current) {
        window.clearTimeout(savePlantNameTimeout.current);
      }
    };
  }, [loadPlantsForHome]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [showAdd, setShowAdd] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletingPlantId, setDeletingPlantId] = useState<string | null>(null);
  const [pendingReplantInterval, setPendingReplantInterval] = useState<number | null>(null);
  const [showReplantChangeConfirm, setShowReplantChangeConfirm] = useState(false);

  useEffect(() => {
    if (selectedPlant) setEditingName(selectedPlant.name);
  }, [selectedPlant?.id]);

  const savePlantNameTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (isLoadingPlants || hasTopBarAnimated.current) return;

    hasTopBarAnimated.current = true;
    window.requestAnimationFrame(() => {
      setIsTopBarVisible(true);
    });
  }, [isLoadingPlants]);

  const handleWater = useCallback(async (id: string) => {
    const nowIso = new Date().toISOString();
    const now = new Date(nowIso);

    // Optimistically water the tapped plant; snapshot for rollback on failure.
    const snapshot: { plants: Plant[] } = { plants: [] };
    setPlants((prev) => {
      snapshot.plants = prev;
      return prev.map((plant) =>
        plant.id === id
          ? {
              ...plant,
              lastWatered: now,
              nextWatering: new Date(now.getTime() + plant.wateringInterval * 24 * 60 * 60 * 1000),
              missedWatering: false,
            }
          : plant,
      );
    });
    appToast.success("Watered");

    const { error } = await supabase
      .from("plants")
      .update({ last_watered: nowIso })
      .eq("id", id);

    if (error) {
      // Restore only the tapped plant so concurrent updates are preserved.
      setPlants((curr) => {
        const original = snapshot.plants.find((plant) => plant.id === id);
        if (!original) return curr;
        return curr.map((plant) => (plant.id === id ? original : plant));
      });
      appToast.error("Water update failed");
    }
  }, []);

  const handleOpenPlant = useCallback((plantId: string) => {
    const plant = plantById.get(plantId);
    if (!plant) return;
    setSelectedPlant(plant);
  }, [plantById]);

  const handleAddPlant = async (_name: string, _interval: number) => {
    if (!activeHomeId) return;
    await loadPlantsForHome(activeHomeId);
    // Optionally handle error
  };

  const handlePlantNameChange = (nextName: string) => {
    setEditingName(nextName);
  };

  const handleBottomSheetClose = () => {
    setSelectedPlant(null);
  };

  const handleConfirmChanges = async () => {
    if (!selectedPlant) return;
    const trimmed = editingName.trim();
    const finalName = trimmed || selectedPlant.name;
    if (finalName !== selectedPlant.name) {
      const plantId = selectedPlant.id;
      setPlants((prev) => prev.map((p) => (p.id === plantId ? { ...p, name: finalName } : p)));
      await supabase.from("plants").update({ name: finalName }).eq("id", plantId);
    }
    setSelectedPlant(null);
    appToast.success("Changes saved");
  };

  const handleActiveHomeChange = async (nextHomeId: string) => {
    setActiveHomeId(nextHomeId);
    setActiveHomeIdState(nextHomeId);
    setSelectedPlant(null);
    await Promise.all([
      loadPlantsForHome(nextHomeId, { initial: true }),
      loadSprayPrefsForHome(nextHomeId),
    ]);
  };

  const handleSprayPress = useCallback(async () => {
    if (!activeHomeId) return;
    const todayIso = new Date().toISOString().slice(0, 10);

    const snapshot = sprayPrefs;
    setSprayPrefs((prev) => (prev ? { ...prev, lastSprayedDate: todayIso } : prev));
    appToast.success("Sprayed");

    const { error } = await supabase
      .from("home_spray_preferences")
      .update({ last_sprayed_date: todayIso })
      .eq("home_id", activeHomeId);

    if (error) {
      setSprayPrefs(snapshot);
      appToast.error("Spray update failed");
    }
  }, [activeHomeId, sprayPrefs]);

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

  const handleDeletePlant = useCallback(async (plantId: string) => {
    const { error } = await supabase.from("plants").delete().eq("id", plantId);
    if (error) {
      appToast.error("Something went wrong");
      return;
    }

    setSelectedPlant(null);
    setShowDeleteConfirm(false);
    setDeletingPlantId(null);

    if (!activeHomeId) return;
    await loadPlantsForHome(activeHomeId);
    appToast.success("Plant deleted");
  }, [activeHomeId, loadPlantsForHome]);

  const handleLongPress = useCallback(() => {
    setDeleteMode(true);
  }, []);

  const handleExitDeleteMode = useCallback(() => {
    setDeleteMode(false);
  }, []);

  const handleDeletePress = useCallback((id: string) => {
    setDeletingPlantId(id);
    setShowDeleteConfirm(true);
  }, []);



  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24 flex flex-col">
          {plants.length > 0 ? (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-[720px] px-6 z-40 pointer-events-none flex items-center justify-end gap-2">
            {!deleteMode && sprayPrefs?.enabled && sprayStatus ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isTopBarVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={handleSprayPress}
                  className="relative flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-foreground transition-all active:scale-95"
                  style={glassAction}
                >
                  <IconDropletsFilled className="h-4 w-4 text-foreground" />
                  <span>{sprayStatus.label}</span>
                  {sprayStatus.urgent && (
                    <div
                      className="absolute -right-[2px] -top-[2px] h-[10px] w-[10px] rounded-full border-2 border-[var(--background-secondary)]"
                      style={{ background: "var(--icon-warning)" }}
                    />
                  )}
                </button>
              </motion.div>
            ) : null}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isTopBarVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-auto"
            >
              {deleteMode ? (
                <button
                  type="button"
                  onClick={() => setDeleteMode(false)}
                  className="flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-foreground transition-all active:scale-95"
                  style={glassAction}
                >
                  Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAdd(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                  style={glassAction}
                  aria-label="Add plant"
                >
                  <IconPlusFilled className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                </button>
              )}
            </motion.div>
            </div>
          ) : null}

          {/* Header — min-h reserves space during load to prevent layout shift */}
          <div className="pl-6 pr-[76px] pt-6 pb-2 min-h-[88px]">
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
            <div className="relative z-[6] mt-4 grid grid-cols-3 gap-1 px-6 min-[720px]:grid-cols-4">
              {sortedPlants.map((plant, i) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    index={i}
                    onOpenPlant={handleOpenPlant}
                    onWater={handleWater}
                    deleteMode={deleteMode}
                    onLongPress={handleLongPress}
                    onExitDeleteMode={handleExitDeleteMode}
                    onDeletePress={handleDeletePress}
                  />
                ))}
            </div>
          ) : null}

      {/* Bottom sheet detail */}
      <AnimatePresence>
        {selectedPlant && (
          <ComponentBottomSheet onClose={handleBottomSheetClose}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-[22px] font-bold text-foreground">
                  {selectedPlant.name}
                </h2>
                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {editingName !== selectedPlant.name && (
                      <motion.button
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        onClick={handleConfirmChanges}
                        className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                        style={{
                          background: "color-mix(in srgb, var(--control-primary) 90%, transparent)",
                          backdropFilter: "blur(40px) saturate(1.8)",
                          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)",
                        }}
                      >
                        <IconCheckFilled className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                  {/* Close button */}
                  <button
                    onClick={handleBottomSheetClose}
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
                right={{ type: "input", value: editingName, onChange: handlePlantNameChange }}
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
        
          </ComponentBottomSheet>
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
                top: 0,
                bottom: 0,
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
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-[22px] font-bold text-foreground">
                  Update replanting interval?
                </h2>
                <button
                  onClick={() => {
                    setShowReplantChangeConfirm(false);
                    setPendingReplantInterval(null);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                  style={glassAction}
                >
                  <IconXFilled className="h-[18px] w-[18px] text-foreground" />
                </button>
              </div>
              <p className="text-base font-medium text-foreground mb-5">
                The counter will reset and restart with the new value.
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
                  Update
                </ButtonLow>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && deletingPlantId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 z-[70] bg-black/40"
              style={{
                top: 0,
                bottom: 0,
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
              }}
              onClick={() => { setShowDeleteConfirm(false); setDeletingPlantId(null); }}
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
              <h2 className="font-serif text-[22px] font-semibold text-foreground">
                Delete this plant?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This will permanently delete the plant and all its data.
              </p>
              <div className="mt-5 flex items-center justify-start gap-2">
                <ButtonLow
                  variant="secondary"
                  onClick={() => { setShowDeleteConfirm(false); setDeletingPlantId(null); }}
                >
                  Cancel
                </ButtonLow>
                <ButtonLow
                  variant="error"
                  onClick={() => handleDeletePlant(deletingPlantId)}
                >
                  Delete
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
