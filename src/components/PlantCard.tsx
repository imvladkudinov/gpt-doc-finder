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
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="glass flex flex-col items-start gap-3 rounded-3xl p-5 text-left transition-shadow hover:shadow-lg"
    >
      <div className="text-4xl">{plant.emoji}</div>
      <div className="w-full">
        <h3 className="font-serif text-base font-semibold text-foreground leading-tight">
          {plant.name}
        </h3>
        <div className="mt-2 flex items-center gap-1.5">
          <Droplets
            className={`h-3.5 w-3.5 ${
              status.urgent ? "text-accent" : "text-primary"
            }`}
          />
          <span
            className={`text-xs font-medium ${
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
