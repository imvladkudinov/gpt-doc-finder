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
              My Plants <span className="font-sans text-lg font-normal text-muted-foreground">{plants.length}</span>
            </h1>
            {needsWater.length > 0 && (
              <p className="mt-1 text-sm text-accent">
                {needsWater.length} plant{needsWater.length > 1 ? "s" : ""} need
                water
              </p>
            )}
            {needsWater.length === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                All plants are happy! 🎉
              </p>
            )}
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
            <span className="text-xs">📍</span>
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
          />
        ))}
      </div>

      {/* Bottom sheet detail */}
      <AnimatePresence>
        {selectedPlant && (
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
                    <p className="text-xs text-muted-foreground">
                      Every {selectedPlant.wateringInterval} days
                    </p>
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

              {/* Status */}
              <div className="mb-4 rounded-2xl bg-background p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Droplets className="h-4 w-4 text-primary" />
                  Next watering: {formatWateringDate(selectedPlant.nextWatering)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last watered: {formatWateringDate(selectedPlant.lastWatered)}
                </p>
              </div>

              {/* Water button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleWater(selectedPlant.id)}
                className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
              >
                💧 Mark as watered
              </motion.button>
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
