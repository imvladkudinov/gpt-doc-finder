import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, AlertTriangle, StickyNote, Check } from "lucide-react";
import { Plant } from "@/types/plant";
import { getWateringStatus, formatWateringDate } from "@/lib/plant-utils";

interface PlantDetailProps {
  plant: Plant;
  onClose: () => void;
  onWater: (id: string) => void;
}

const PlantDetail = ({ plant, onClose, onWater }: PlantDetailProps) => {
  const status = getWateringStatus(plant);
  const [showWatered, setShowWatered] = useState(false);

  const handleWater = () => {
    onWater(plant.id);
    setShowWatered(true);
    setTimeout(() => setShowWatered(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-md rounded-t-3xl p-6 sm:rounded-3xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{plant.emoji}</span>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">
                {plant.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Every {plant.wateringInterval} days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status */}
        <div className="mb-4 rounded-2xl bg-secondary p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Droplets className="h-4 w-4 text-primary" />
            Next watering: {formatWateringDate(plant.nextWatering)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Last watered: {formatWateringDate(plant.lastWatered)}
          </p>
        </div>

        {/* Missed warning */}
        {status.urgent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 flex items-start gap-3 rounded-2xl bg-terracotta-light p-4"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-medium text-accent-foreground">
                Did you forget to water?
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tap below to mark as watered and we'll adjust the schedule.
              </p>
            </div>
          </motion.div>
        )}

        {/* Notes */}
        {plant.notes && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl bg-muted p-4">
            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{plant.notes}</p>
          </div>
        )}

        {/* Water button */}
        <AnimatePresence mode="wait">
          {showWatered ? (
            <motion.div
              key="watered"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-sage-100 py-4 text-sm font-medium text-primary"
            >
              <Check className="h-5 w-5" />
              Watered! Schedule updated 🌱
            </motion.div>
          ) : (
            <motion.button
              key="water"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleWater}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
            >
              💧 Mark as watered
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PlantDetail;
