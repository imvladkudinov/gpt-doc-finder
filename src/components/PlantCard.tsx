import React from "react";
import { motion } from "framer-motion";
import { IconLeafFilled } from "@tabler/icons-react";
import { Plant } from "@/types/plant";
import { getWateringStatus } from "@/lib/plant-utils";
import { ButtonLow } from "@/components/ui/ButtonLow";

interface PlantCardProps {
  plant: Plant;
  onOpenPlant: (plantId: string) => void;
  onOpenOverdue?: (plantId: string) => void;
  onWater?: (plantId: string) => void;
  index: number;
}

const ComponentPlantCard = ({ plant, onOpenPlant, onOpenOverdue, onWater, index }: PlantCardProps) => {
  const status = getWateringStatus(plant);
  const plantId = plant.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpenPlant(plantId)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenPlant(plantId);
        }
      }}
      role="button"
      tabIndex={0}
      className="relative flex h-[220px] flex-col items-start justify-between rounded-[28px] bg-[var(--background-secondary)] px-2 pb-3 pt-5 text-left shadow-sm transition-shadow hover:shadow-md"
    >
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
                  onOpenOverdue?.(plantId);
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
    prev.onOpenPlant === next.onOpenPlant &&
    prev.onOpenOverdue === next.onOpenOverdue &&
    prev.onWater === next.onWater
  );
};

export default React.memo(ComponentPlantCard, propsAreEqual);
