import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import PlantCard from "@/components/PlantCard";
import PlantDetail from "@/components/PlantDetail";
import AddPlantDialog from "@/components/AddPlantDialog";
import TabBar from "@/components/TabBar";
import { mockPlants } from "@/data/mockPlants";
import { Plant } from "@/types/plant";

const Plants = () => {
  const [plants, setPlants] = useState<Plant[]>(mockPlants);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showAdd, setShowAdd] = useState(false);

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
    };
    setPlants((prev) => [...prev, newPlant]);
  };

  const needsWater = plants.filter(
    (p) => p.missedWatering || new Date(p.nextWatering) <= new Date()
  );

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-2xl font-bold text-foreground">
            My Plants 🌿
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
        </motion.div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 px-6 sm:grid-cols-3">
        {plants.map((plant, i) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            index={i}
            onClick={() => setSelectedPlant(plant)}
          />
        ))}

        {/* Add button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: plants.length * 0.08 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border p-5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs font-medium">Add plant</span>
        </motion.button>
      </div>

      {/* Detail sheet */}
      <AnimatePresence>
        {selectedPlant && (
          <PlantDetail
            plant={selectedPlant}
            onClose={() => setSelectedPlant(null)}
            onWater={handleWater}
          />
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
    </PageTransition>
  );
};

export default Plants;
