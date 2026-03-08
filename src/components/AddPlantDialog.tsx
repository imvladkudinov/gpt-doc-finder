import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";

interface AddPlantDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, emoji: string, interval: number) => void;
}

const PLANT_EMOJIS = ["🪴", "🌿", "🌵", "🌱", "🪷", "🌸", "🌻", "🍀", "🌾", "🌺"];

const AddPlantDialog = ({ open, onClose, onAdd }: AddPlantDialogProps) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🪴");
  const [interval, setInterval] = useState(7);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), emoji, interval);
    setName("");
    setEmoji("🪴");
    setInterval(7);
    onClose();
  };

  return (
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
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-foreground">Add a plant</h2>
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

        {/* Emoji picker */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Choose an icon</label>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Plant name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monstera, Fern, Cactus"
            className="w-full rounded-xl border-0 bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Interval */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Water every {interval} days
          </label>
          <input
            type="range"
            min={1}
            max={30}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Daily</span>
            <span>Monthly</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add plant
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AddPlantDialog;
