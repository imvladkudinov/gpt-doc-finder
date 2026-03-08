import { motion } from "framer-motion";
import { Plant } from "@/types/plant";
import { getWateringStatus } from "@/lib/plant-utils";
import { Droplets } from "lucide-react";

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
  index: number;
}

const PlantCard = ({ plant, onClick, index }: PlantCardProps) => {
  const status = getWateringStatus(plant);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-2xl bg-card p-3.5 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="text-2xl">{plant.emoji}</div>
      <div className="w-full">
        <h3 className="font-serif text-xs font-semibold text-foreground leading-tight truncate">
          {plant.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1">
          <Droplets
            className={`h-3 w-3 ${
              status.urgent ? "text-accent" : "text-primary"
            }`}
          />
          <span
            className={`text-[10px] font-medium ${
              status.urgent ? "text-accent" : "text-muted-foreground"
            }`}
          >
            {status.label}
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default PlantCard;
