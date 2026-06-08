import React, { useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { IconLeafFilled, IconMinus } from "@tabler/icons-react";
import { Plant } from "@/types/plant";
import { getWateringStatus } from "@/lib/plant-utils";
import { ButtonLow } from "@/components/ui/ButtonLow";

interface PlantCardProps {
  plant: Plant;
  onOpenPlant: (plantId: string) => void;
  onWater?: (plantId: string) => void;
  onLongPress?: () => void;
  onDeletePress?: (plantId: string) => void;
  onExitDeleteMode?: () => void;
  deleteMode?: boolean;
  index: number;
}

const jiggleVariants = [
  { rotate: [-0.77, 0.77], duration: 0.28 },
  { rotate: [ 0.81,-0.81], duration: 0.26 },
  { rotate: [-0.72, 0.72], duration: 0.31 },
  { rotate: [ 0.78,-0.78], duration: 0.26 },
  { rotate: [-0.83, 0.83], duration: 0.30 },
  { rotate: [ 0.75,-0.75], duration: 0.28 },
  { rotate: [-0.70, 0.70], duration: 0.26 },
  { rotate: [ 0.82,-0.82], duration: 0.31 },
  { rotate: [-0.77, 0.77], duration: 0.27 },
];

const getJiggle = (index: number) => {
  const v = jiggleVariants[index % jiggleVariants.length];
  return {
    rotate: v.rotate,
    transition: {
      duration: v.duration,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut",
    },
  };
};

const ComponentPlantCard = ({ plant, onOpenPlant, onWater, onLongPress, onDeletePress, onExitDeleteMode, deleteMode, index }: PlantCardProps) => {
  const status = getWateringStatus(plant);
  const plantId = plant.id;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const controls = useAnimation();

  React.useEffect(() => {
    if (deleteMode) {
      controls.start(getJiggle(index));
    } else {
      controls.stop();
      controls.set({ rotate: 0 });
    }
  }, [deleteMode, controls]);

  const handlePointerDown = () => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress?.();
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handlePointerMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={deleteMode ? controls : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileTap={deleteMode ? undefined : { scale: 0.97 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onClick={() => { if (!deleteMode) onOpenPlant(plantId); }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!deleteMode) onOpenPlant(plantId);
        }
      }}
      role="button"
      tabIndex={0}
      style={{ originX: 0.5, originY: 0.5, WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}
      className="relative flex h-[220px] flex-col items-start justify-between rounded-[28px] bg-[var(--background-secondary)] px-2 pb-3 pt-5 text-left shadow-sm transition-shadow hover:shadow-md select-none"
    >
      {deleteMode && (
        <button
          className="absolute -left-[6px] -top-[6px] z-10 flex h-6 w-6 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
            backdropFilter: "blur(40px) saturate(1.8)",
            WebkitBackdropFilter: "blur(40px) saturate(1.8)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDeletePress?.(plantId);
          }}
        >
          <IconMinus className="h-3 w-3 text-foreground" strokeWidth={3} />
        </button>
      )}
      <div className="w-full">
        <div className="flex w-full items-center justify-center">
          <div className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--background-main)]">
            <IconLeafFilled className="h-5 w-5 text-icon-primary" />
            {status.urgent && (
              <div
                className="absolute -right-[2px] -top-[2px] h-[18px] w-[18px] rounded-full border-2 border-[var(--background-secondary)]"
                style={{ background: "var(--icon-warning)" }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            )}
          </div>
        </div>
        <div className="mt-3 w-full text-center">
          <h3 className="font-serif text-[16px] font-semibold leading-tight text-foreground line-clamp-2">
            {plant.name}
          </h3>
          <span
            className="mt-1 block py-[2px] text-[12px] font-medium leading-none"
            style={{ color: status.urgent ? "var(--text-warning)" : "var(--text-secondary)" }}
          >
            {status.label}
          </span>
        </div>
      </div>
      {/* Watered button */}
      <div className="mt-2 w-full px-1">
        <ButtonLow
          variant="secondary"
          className="h-11 w-full"
          onClick={(e) => {
            e.stopPropagation();
            onWater?.(plantId);
          }}
        >
          Water
        </ButtonLow>
      </div>
    </motion.div>
  );
};

const propsAreEqual = (prev: PlantCardProps, next: PlantCardProps) => {
  return (
    prev.index === next.index &&
    prev.plant === next.plant &&
    prev.deleteMode === next.deleteMode &&
    prev.onOpenPlant === next.onOpenPlant &&
    prev.onWater === next.onWater &&
    prev.onLongPress === next.onLongPress &&
    prev.onDeletePress === next.onDeletePress &&
    prev.onExitDeleteMode === next.onExitDeleteMode
  );
};

export default React.memo(ComponentPlantCard, propsAreEqual);
