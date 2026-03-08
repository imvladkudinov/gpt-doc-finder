import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Home, Droplets, X, Sparkles, RefreshCw } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import PlantCard from "@/components/PlantCard";
import AddPlantDialog from "@/components/AddPlantDialog";

import { mockPlants } from "@/data/mockPlants";
import { Plant } from "@/types/plant";
import { getWateringStatus, formatWateringDate } from "@/lib/plant-utils";

const Plants = () => {
  const [plants, setPlants] = useState<Plant[]>(mockPlants);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [carouselField, setCarouselField] = useState<"watering" | "replanting" | null>(null);
  const [overduePlant, setOverduePlant] = useState<Plant | null>(null);

  const handleWater = (id: string) => {
    setPlants((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              lastWatered: new Date(),
              nextWatering: new Date(
                Date.now() + p.wateringInterval * 24 * 60 * 60 * 1000
              ),
              missedWatering: false,
            }
          : p
      )
    );
    setSelectedPlant((prev) =>
      prev?.id === id
        ? {
            ...prev,
            lastWatered: new Date(),
            nextWatering: new Date(
              Date.now() + prev.wateringInterval * 24 * 60 * 60 * 1000
            ),
            missedWatering: false,
          }
        : prev
    );
  };

  const handleAddPlant = (name: string, emoji: string, interval: number) => {
    const newPlant: Plant = {
      id: String(Date.now()),
      name,
      emoji,
      wateringInterval: interval,
      nextWatering: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
      lastWatered: new Date(),
      missedWatering: false,
      notes: "",
      replantingInterval: 12,
      nextReplanting: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      autoSchedule: false,
    };
    setPlants((prev) => [...prev, newPlant]);
  };

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const WheelPicker = ({
  items,
  value,
  onChange,
  formatItem,
}: {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  formatItem: (v: number) => string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (containerRef.current && !isScrollingRef.current) {
      const idx = items.indexOf(value);
      containerRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  }, [value, items]);

  const handleScroll = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isScrollingRef.current = true;
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const idx = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(idx, items.length - 1));
        containerRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
        onChange(items[clamped]);
      }
      isScrollingRef.current = false;
    }, 80);
  };

  return (
    <div className="relative flex-1" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
      <div
        className="pointer-events-none absolute left-0 right-0 z-10 rounded-xl bg-sage-100"
        style={{ top: ITEM_HEIGHT * 2, height: ITEM_HEIGHT }}
      />
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-20 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-20 bg-gradient-to-t from-card to-transparent" />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-none"
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-center text-lg font-semibold text-foreground"
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: "start" }}
          >
            {formatItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};


  return (
    <PageTransition>
    <ScrollFadeLayout>
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              My Plants
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{plants.length} plants</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
              backdropFilter: "blur(40px) saturate(1.8)",
              WebkitBackdropFilter: "blur(40px) saturate(1.8)",
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <Plus className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
          </button>
        </motion.div>

        {/* Info tabs */}
        <div className="mt-3 flex gap-2">
          <div
            className="flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1.5"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
              backdropFilter: "blur(40px) saturate(1.8)",
              WebkitBackdropFilter: "blur(40px) saturate(1.8)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <span className="text-xs">☀️</span>
            <span className="text-xs font-medium text-foreground">Barcelona, ES</span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1.5"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
              backdropFilter: "blur(40px) saturate(1.8)",
              WebkitBackdropFilter: "blur(40px) saturate(1.8)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <Home className="h-3 w-3 text-foreground fill-foreground" />
            <span className="text-xs font-medium text-foreground">22°C</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2.5 px-6 mt-4">
        {plants.map((plant, i) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            index={i}
            onClick={() => setSelectedPlant(plant)}
            onOverdueClick={() => setOverduePlant(plant)}
          />
        ))}
      </div>

      {/* Bottom sheet detail */}
      <AnimatePresence>
        {selectedPlant && !carouselField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setSelectedPlant(null)}
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
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedPlant.emoji}</span>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-foreground">
                      {selectedPlant.name}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlant(null)}
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

              {/* Watering interval row */}
              <button
                onClick={() => !selectedPlant.autoSchedule && setCarouselField("watering")}
                className="mb-2 flex w-full items-center justify-between rounded-2xl bg-background p-4"
              >
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Watering interval</span>
                </div>
                <span className={`text-xs font-medium text-muted-foreground ${selectedPlant.autoSchedule ? "opacity-50" : ""}`}>
                  {selectedPlant.wateringInterval} days
                </span>
              </button>

              {/* Replanting interval row */}
              <button
                onClick={() => !selectedPlant.autoSchedule && setCarouselField("replanting")}
                className="mb-2 flex w-full items-center justify-between rounded-2xl bg-background p-4"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Replanting interval</span>
                </div>
                <span className={`text-xs font-medium text-muted-foreground ${selectedPlant.autoSchedule ? "opacity-50" : ""}`}>
                  {selectedPlant.replantingInterval} mo
                </span>
              </button>

              {/* Next watering info */}
              <div className="mb-2 flex items-center justify-between rounded-2xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Next watering</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatWateringDate(selectedPlant.nextWatering)}
                </span>
              </div>

              {/* Next replanting info */}
              <div className="mb-2 flex items-center justify-between rounded-2xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Next replanting</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatWateringDate(selectedPlant.nextReplanting)}
                </span>
              </div>

              {/* Auto schedule toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Let app decide</span>
                </div>
                <button
                  onClick={() => {
                    const updated = { ...selectedPlant, autoSchedule: !selectedPlant.autoSchedule };
                    setSelectedPlant(updated);
                    setPlants((prev) => prev.map((p) => p.id === updated.id ? updated : p));
                  }}
                  className={`relative h-7 w-12 rounded-full transition-colors ${selectedPlant.autoSchedule ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
                    style={{ left: selectedPlant.autoSchedule ? "calc(100% - 26px)" : "2px" }}
                  />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS-style scroll picker bottom sheet */}
      <AnimatePresence>
        {selectedPlant && carouselField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setCarouselField(null)}
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
                  {carouselField === "watering" ? "Watering interval" : "Replanting interval"}
                </h2>
                <button
                  onClick={() => setCarouselField(null)}
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

              {/* Wheel picker */}
              <WheelPicker
                items={carouselField === "watering" ? [1,2,3,4,5,7,10,14,21,30] : [3,6,9,12,18,24,36]}
                value={carouselField === "watering" ? selectedPlant.wateringInterval : selectedPlant.replantingInterval}
                onChange={(val) => {
                  const updated = carouselField === "watering"
                    ? { ...selectedPlant, wateringInterval: val }
                    : { ...selectedPlant, replantingInterval: val };
                  setSelectedPlant(updated);
                  setPlants((prev) => prev.map((p) => p.id === updated.id ? updated : p));
                }}
                formatItem={(v) => `${v} ${carouselField === "watering" ? "days" : "months"}`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carousel bottom sheet */}
      <AnimatePresence>
        {selectedPlant && carouselField && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setCarouselField(null)}
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
                  {carouselField === "watering" ? "Watering interval" : "Replanting interval"}
                </h2>
                <button
                  onClick={() => setCarouselField(null)}
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

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(carouselField === "watering"
                  ? [1, 2, 3, 4, 5, 7, 10, 14, 21, 30]
                  : [3, 6, 9, 12, 18, 24, 36]
                ).map((val) => {
                  const current = carouselField === "watering" ? selectedPlant.wateringInterval : selectedPlant.replantingInterval;
                  const isActive = val === current;
                  return (
                    <button
                      key={val}
                      onClick={() => {
                        const updated = carouselField === "watering"
                          ? { ...selectedPlant, wateringInterval: val }
                          : { ...selectedPlant, replantingInterval: val };
                        setSelectedPlant(updated);
                        setPlants((prev) => prev.map((p) => p.id === updated.id ? updated : p));
                      }}
                      className={`flex-shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-foreground"
                      }`}
                    >
                      {val} {carouselField === "watering" ? "days" : "mo"}
                    </button>
                  );
                })}
              </div>
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
              className="fixed inset-0 z-[70] bg-black/40"
              onClick={() => setOverduePlant(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 z-[70] w-[85%] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)",
                backdropFilter: "blur(40px) saturate(1.6)",
                WebkitBackdropFilter: "blur(40px) saturate(1.6)",
                border: "1px solid rgba(255,255,255,0.35)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <p className="text-3xl mb-2">{overduePlant.emoji}</p>
              <p className="text-base font-semibold text-foreground mb-1">
                {overduePlant.name} needs water
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                Was it watered earlier and you forgot to mark it?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleWater(overduePlant.id);
                    setOverduePlant(null);
                  }}
                  className="flex-1 rounded-2xl bg-muted py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Yes, already watered
                </button>
                <button
                  onClick={() => {
                    handleWater(overduePlant.id);
                    setOverduePlant(null);
                  }}
                  className="flex-1 rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  Water now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </ScrollFadeLayout>
    </PageTransition>
  );
};

export default Plants;
