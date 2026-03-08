import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, BookOpen, Droplets, X, Sparkles, RefreshCw } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import PlantCard from "@/components/PlantCard";
import AddPlantDialog from "@/components/AddPlantDialog";
import WheelPicker from "@/components/WheelPicker";
import PlantWikiSheet from "@/components/PlantWikiSheet";

import { mockPlants } from "@/data/mockPlants";
import { Plant } from "@/types/plant";
import { getWateringStatus, formatWateringDate } from "@/lib/plant-utils";
import { getPlantInfo } from "@/lib/plant-info";

const Plants = () => {
  const [plants, setPlants] = useState<Plant[]>(mockPlants);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [carouselField, setCarouselField] = useState<"watering" | "replanting" | null>(null);
  const [overduePlant, setOverduePlant] = useState<Plant | null>(null);
  const [showPlantInfo, setShowPlantInfo] = useState(false);
  const [showWiki, setShowWiki] = useState(false);

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



  return (
    <PageTransition>
    <ScrollFadeLayout>
    <div className="min-h-screen bg-background pb-24">
      {/* Fixed top-right buttons */}
      <div className="fixed top-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowWiki(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
            backdropFilter: "blur(40px) saturate(1.8)",
            WebkitBackdropFilter: "blur(40px) saturate(1.8)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <BookOpen className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
        </button>
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
      </div>

      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-2xl font-bold text-foreground">
            My Plants
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{plants.length} plants</p>
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
            <span className="text-xs">🏠</span>
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
            onWater={() => handleWater(plant.id)}
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
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const status = getWateringStatus(selectedPlant);
                        return status.daysLeft === 0 ? "In 0 days" : status.label;
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Help button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlantInfo(true);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                      backdropFilter: "blur(40px) saturate(1.8)",
                      WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                      border: "1px solid rgba(255,255,255,0.5)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                    }}
                  >
                    <span className="text-base font-bold text-foreground">?</span>
                  </button>
                  {/* Close button */}
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
              </div>

              {/* Watering interval row */}
              <button
                onClick={() => !selectedPlant.autoSchedule && setCarouselField("watering")}
                className="mb-2 flex w-full items-center justify-between rounded-2xl bg-secondary px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">Watering interval</span>
                </div>
                <span className={`rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-all ${selectedPlant.autoSchedule ? "opacity-60" : ""}`}>
                  {selectedPlant.wateringInterval} days
                </span>
              </button>

              {/* Replanting interval row */}
              <button
                onClick={() => !selectedPlant.autoSchedule && setCarouselField("replanting")}
                className="mb-2 flex w-full items-center justify-between rounded-2xl bg-secondary px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">Replanting interval</span>
                </div>
                <span className={`rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-all ${selectedPlant.autoSchedule ? "opacity-60" : ""}`}>
                  {selectedPlant.replantingInterval} mo
                </span>
              </button>

              {/* Next watering info */}
              <div className="mb-2 flex items-center justify-between rounded-2xl bg-secondary px-5 py-4">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">Next watering</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatWateringDate(selectedPlant.nextWatering)}
                </span>
              </div>

              {/* Next replanting info */}
              <div className="mb-2 flex items-center justify-between rounded-2xl bg-secondary px-5 py-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">Next replanting</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatWateringDate(selectedPlant.nextReplanting)}
                </span>
              </div>

              {/* Auto schedule toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-secondary px-5 py-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">Let us care</span>
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

    {/* Plant Info Bottom Sheet */}
    <AnimatePresence>
      {showPlantInfo && selectedPlant && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={() => setShowPlantInfo(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-card p-6 pb-10"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-foreground">
                {selectedPlant.name}
              </h2>
              <button
                onClick={() => setShowPlantInfo(false)}
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

            {(() => {
              const info = getPlantInfo(selectedPlant.name);
              return (
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-foreground">{info.about.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{info.about.body}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-foreground">{info.likes.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{info.likes.body}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-base font-semibold text-foreground">{info.care.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{info.care.body}</p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    </ScrollFadeLayout>
    </PageTransition>
  );
};

export default Plants;
