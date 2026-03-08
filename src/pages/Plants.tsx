import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Home, Droplets, X, ChevronRight, Sparkles, RefreshCw } from "lucide-react";
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

  const needsWater = plants.filter(
    (p) => p.missedWatering || new Date(p.nextWatering) <= new Date()
  );

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
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
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
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
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
                <div className="flex items-center gap-2">
                  <span className={`rounded-xl px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary ${selectedPlant.autoSchedule ? "opacity-50" : ""}`}>
                    {selectedPlant.wateringInterval} days
                  </span>
                  {!selectedPlant.autoSchedule && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
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
                <div className="flex items-center gap-2">
                  <span className={`rounded-xl px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary ${selectedPlant.autoSchedule ? "opacity-50" : ""}`}>
                    {selectedPlant.replantingInterval} mo
                  </span>
                  {!selectedPlant.autoSchedule && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Next watering info */}
              <div className="mb-2 rounded-2xl bg-background p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Droplets className="h-4 w-4 text-primary" />
                  Next watering: {formatWateringDate(selectedPlant.nextWatering)}
                </div>
              </div>

              {/* Next replanting info */}
              <div className="mb-2 rounded-2xl bg-background p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Next replanting: {formatWateringDate(selectedPlant.nextReplanting)}
                </div>
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
                  className={`relative h-7 w-12 rounded-full transition-colors ${selectedPlant.autoSchedule ? "bg-primary" : "bg-muted"}`}
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
    </div>
    </ScrollFadeLayout>
    </PageTransition>
  );
};

export default Plants;
