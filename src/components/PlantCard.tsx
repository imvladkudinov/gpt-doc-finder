import { motion } from "framer-motion";
import { Plant } from "@/types/plant";
import { getWateringStatus } from "@/lib/plant-utils";

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
  onOverdueClick?: () => void;
  onWater?: () => void;
  index: number;
}

const PlantCard = ({ plant, onClick, onOverdueClick, onWater, index }: PlantCardProps) => {
  const status = getWateringStatus(plant);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative flex min-h-[140px] flex-col items-start justify-between rounded-xl bg-card p-3.5 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Orange overdue indicator */}
      {status.daysLeft === 0 && (
        <div
          className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full"
          style={{ background: "hsl(20 70% 60%)", boxShadow: "0 0 8px hsla(20,70%,60%,0.3)" }}
          onClick={(e) => {
            e.stopPropagation();
            onOverdueClick?.();
          }}
        />
      )}
      <div>
        <div className="text-4xl">{plant.emoji}</div>
        <div className="mt-1.5 w-full">
          <h3 className="font-serif text-[15px] font-semibold text-foreground leading-tight line-clamp-2">
            {plant.name}
          </h3>
          <span className="text-[10px] font-medium text-muted-foreground leading-none">
            {status.daysLeft === 0 ? "In 0 days" : status.label}
          </span>
        </div>
      </div>
      {/* Watered button */}
      <div
        className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary/10 py-1.5 text-primary transition-colors active:bg-primary/20"
        onClick={(e) => {
          e.stopPropagation();
          onWater?.();
        }}
      >
        <span className="text-[10px] font-semibold">Watered</span>
      </div>
    </motion.button>
  );
};

export default PlantCard;
