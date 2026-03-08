import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, AlertTriangle, StickyNote, Check, HelpCircle } from "lucide-react";
import { Plant } from "@/types/plant";
import { getWateringStatus, formatWateringDate } from "@/lib/plant-utils";
import { getPlantInfo } from "@/lib/plant-info";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PlantDetailProps {
  plant: Plant;
  onClose: () => void;
  onWater: (id: string) => void;
}

const PlantDetail = ({ plant, onClose, onWater }: PlantDetailProps) => {
  const status = getWateringStatus(plant);
  const [showWatered, setShowWatered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleWater = () => {
    onWater(plant.id);
    setShowWatered(true);
    setTimeout(() => setShowWatered(false), 2000);
  };

  const plantInfo = getPlantInfo(plant.name);

  return (
    <>
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
            <div className="flex items-center gap-2">
              {/* Help button */}
              <button
                onClick={() => setShowInfo(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                  backdropFilter: "blur(40px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                <HelpCircle className="h-[18px] w-[18px] text-foreground/55" strokeWidth={2.5} />
              </button>
              {/* Close button */}
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                  backdropFilter: "blur(40px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                <X className="h-[18px] w-[18px] text-foreground/55" strokeWidth={2.5} />
              </button>
            </div>
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

          {/* Intervals - muted/disabled style */}
          <div className="mb-4 rounded-2xl bg-muted/50 p-4 opacity-60">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Watering interval</span>
              <span className="text-foreground/60">{plant.wateringInterval} days</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-foreground/60">Replanting interval</span>
              <span className="text-foreground/60">{plant.replantingInterval} months</span>
            </div>
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

      {/* Plant Info Bottom Sheet */}
      <Sheet open={showInfo} onOpenChange={setShowInfo}>
        <SheetContent side="bottom" className="z-[60] rounded-t-3xl px-6 pb-10 pt-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-serif text-xl">
              {plant.emoji} {plant.name}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-5">
            <div>
              <h3 className="mb-1.5 text-sm font-semibold text-foreground">{plantInfo.about.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{plantInfo.about.body}</p>
            </div>
            <div>
              <h3 className="mb-1.5 text-sm font-semibold text-foreground">{plantInfo.likes.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{plantInfo.likes.body}</p>
            </div>
            <div>
              <h3 className="mb-1.5 text-sm font-semibold text-foreground">{plantInfo.care.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{plantInfo.care.body}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default PlantDetail;
