import { motion } from "framer-motion";
import { IconLeafFilled } from "@tabler/icons-react";
import { Plant } from "@/types/plant";
import { getWateringStatus } from "@/lib/plant-utils";
import { ButtonLow } from "@/components/ui/ButtonLow";

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
  onOverdueClick?: () => void;
  onWater?: () => void;
  index: number;
}

const ComponentPlantCard = ({ plant, onClick, onOverdueClick, onWater, index }: PlantCardProps) => {
  const status = getWateringStatus(plant);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="relative flex h-[220px] flex-col items-start justify-between rounded-[28px] bg-[var(--background-secondary)] px-3 pb-3 pt-5 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Orange overdue indicator */}
      {status.urgent && (
        <div
          className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full"
          style={{ background: "var(--icon-warning)", boxShadow: "0 0 8px var(--background-overlay)" }}
          onClick={(e) => {
            e.stopPropagation();
            onOverdueClick?.();
          }}
        />
      )}
      <div className="w-full">
        <div className="flex w-full items-center justify-center">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--background-main)]">
            <IconLeafFilled className="h-5 w-5 text-icon-primary" />
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
      <ButtonLow
        variant="secondary"
        className="mt-2 h-11 w-full"
        onClick={(e) => {
          e.stopPropagation();
          onWater?.();
        }}
      >
        Water
      </ButtonLow>
    </motion.div>
  );
};

export default ComponentPlantCard;
