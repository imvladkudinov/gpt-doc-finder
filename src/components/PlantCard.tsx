import { motion } from "framer-motion";
import { Plant } from "@/types/plant";
import { getWateringStatus } from "@/lib/plant-utils";

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
  onOverdueClick?: () => void;
  index: number;
}

const PlantCard = ({ plant, onClick, onOverdueClick, index }: PlantCardProps) => {
  const status = getWateringStatus(plant);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative flex min-h-[140px] flex-col items-start gap-2 rounded-2xl bg-card p-3.5 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Orange overdue indicator */}
      {status.daysLeft === 0 && (
        <div
          className="absolute top-2.5 right-2.5 h-3 w-3 rounded-full"
          style={{ background: "hsl(25 90% 55%)", boxShadow: "0 0 6px hsla(25,90%,55%,0.4)" }}
          onClick={(e) => {
            e.stopPropagation();
            onOverdueClick?.();
          }}
        />
      )}
      <div className="text-4xl">{plant.emoji}</div>
      <div className="w-full">
        <h3 className="font-serif text-[15px] font-semibold text-foreground leading-tight truncate">
          {plant.name}
        </h3>
        <div className="mt-0.5">
          <span className="text-[10px] font-medium text-muted-foreground">
            {status.daysLeft === 0 ? "In 0 days" : status.label}
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default PlantCard;
