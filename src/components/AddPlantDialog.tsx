import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Droplets, RefreshCw, Pencil } from "lucide-react";

interface AddPlantDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, emoji: string, interval: number) => void;
}

const PLANT_EMOJIS = ["🪴", "🌿", "🌵", "🌱", "🪷", "🌸", "🌻", "🍀", "🌾", "🌺"];

const AddPlantDialog = ({ open, onClose, onAdd }: AddPlantDialogProps) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🪴");
  const [wateringInterval, setWateringInterval] = useState(7);
  const [replantingInterval, setReplantingInterval] = useState(12);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), emoji, wateringInterval);
    setName("");
    setEmoji("🪴");
    setWateringInterval(7);
    setReplantingInterval(12);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
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
          <h2 className="font-serif text-lg font-bold text-foreground">Add a plant</h2>
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
            <X className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
          </button>
        </div>

        {/* Emoji picker */}
        <div className="mb-4 flex flex-wrap gap-2">
          {PLANT_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`rounded-xl p-2.5 text-2xl transition-all ${
                emoji === e
                  ? "bg-primary/10 ring-2 ring-primary"
                  : "hover:bg-secondary"
              }`}
            >
              {e}
            </button>
          ))}
          <button
            className="flex items-center justify-center rounded-xl p-2.5 text-muted-foreground hover:bg-secondary transition-all"
          >
            <Plus className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Name row - list cell style */}
        <div className="mb-2 flex items-center justify-between rounded-2xl bg-background p-4">
          <div className="flex items-center gap-3">
            <Pencil className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Name</span>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Plant name"
            className="w-1/2 bg-transparent text-right text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>

        {/* Watering interval row */}
        <div className="mb-2 flex items-center justify-between rounded-2xl bg-background p-4">
          <div className="flex items-center gap-3">
            <Droplets className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Watering interval</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {wateringInterval} days
          </span>
        </div>

        {/* Replanting interval row */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-background p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Replanting interval</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {replantingInterval} mo
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full rounded-3xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          Add plant
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AddPlantDialog;
