import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Droplets, RefreshCw, Pencil, Camera } from "lucide-react";

interface AddPlantDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, emoji: string, interval: number) => void;
}

const PLANT_EMOJIS = ["🪴", "🌿", "🌵", "🌱", "🪷", "🌸", "🌻", "🍀", "🌾", "🌺"];

const WATERING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30];
const REPLANTING_OPTIONS = [3, 6, 9, 12, 18, 24, 36];

const AddPlantDialog = ({ open, onClose, onAdd }: AddPlantDialogProps) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🪴");
  const [wateringInterval, setWateringInterval] = useState(7);
  const [replantingInterval, setReplantingInterval] = useState(12);
  const [showWateringPicker, setShowWateringPicker] = useState(false);
  const [showReplantingPicker, setShowReplantingPicker] = useState(false);

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

  const glassClose = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
    backdropFilter: "blur(40px) saturate(1.8)",
    WebkitBackdropFilter: "blur(40px) saturate(1.8)",
    border: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
  };

  return (
    <>
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
              style={glassClose}
            >
              <X className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
            </button>
          </div>

          {/* Photo identification banner */}
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-secondary p-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Don't know what that plant is?</p>
                <p className="text-xs text-muted-foreground">We'll take care</p>
              </div>
            </div>
            <button className="rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all active:scale-95">
              Photo
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

          {/* Name row */}
          <div className="mb-2 flex items-center justify-between rounded-2xl bg-secondary p-4">
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
          <div className="mb-2 flex items-center justify-between rounded-2xl bg-secondary p-4">
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Watering interval</span>
            </div>
            <button
              onClick={() => setShowWateringPicker(true)}
              className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-all active:scale-95"
            >
              {wateringInterval} days
            </button>
          </div>

          {/* Replanting interval row */}
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-secondary p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Replanting interval</span>
            </div>
            <button
              onClick={() => setShowReplantingPicker(true)}
              className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary transition-all active:scale-95"
            >
              {replantingInterval} mo
            </button>
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

      {/* Watering interval picker */}
      <AnimatePresence>
        {showWateringPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowWateringPicker(false)}
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
                <h3 className="font-serif text-lg font-bold text-foreground">Watering interval</h3>
                <button
                  onClick={() => setShowWateringPicker(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
                  style={glassClose}
                >
                  <X className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {WATERING_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setWateringInterval(d);
                      setShowWateringPicker(false);
                    }}
                    className={`rounded-2xl py-3 text-sm font-medium transition-all active:scale-95 ${
                      wateringInterval === d
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {d} {d === 1 ? "day" : "days"}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replanting interval picker */}
      <AnimatePresence>
        {showReplantingPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowReplantingPicker(false)}
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
                <h3 className="font-serif text-lg font-bold text-foreground">Replanting interval</h3>
                <button
                  onClick={() => setShowReplantingPicker(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
                  style={glassClose}
                >
                  <X className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {REPLANTING_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setReplantingInterval(m);
                      setShowReplantingPicker(false);
                    }}
                    className={`rounded-2xl py-3 text-sm font-medium transition-all active:scale-95 ${
                      replantingInterval === m
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {m} mo
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddPlantDialog;
