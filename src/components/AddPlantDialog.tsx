import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { IconXFilled, IconDropletFilled, IconKeyframesFilled, IconPencilFilled, IconCalendarWeekFilled } from "@tabler/icons-react";
import { ButtonLarge } from "@/components/ui/ButtonLarge";
import { ListCell } from "@/components/ui/ListCell";
import { ensureActiveHomeForCurrentUser } from "@/lib/homes";
import { appToast } from "@/lib/app-toast";

interface AddPlantDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, interval: number) => void;
}


const glassClose = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
  backdropFilter: "blur(40px) saturate(1.8)",
  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.5)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
};

const ComponentAddPlantDialog = ({ open, onClose, onAdd }: AddPlantDialogProps) => {
  const [name, setName] = useState("");
  const [wateringInterval, setWateringInterval] = useState(7);
  const [replantingInterval, setReplantingInterval] = useState(12);

  // Watering interval options: 1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,24,28,32,36,40,48,56,64
  const WATERING_OPTIONS = [1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,24,28,32,36,40,48,56,64];
  const REPLANTING_OPTIONS = Array.from({ length: 12 }, (_, i) => 3 + i * 3); // 3, 6, ..., 36

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      appToast.error("Please add a name");
      return;
    }
    const activeHomeId = await ensureActiveHomeForCurrentUser();
    if (!activeHomeId) return;

    // Insert plant into Supabase
    const { error } = await supabase
      .from("plants")
      .insert([
        {
          home_id: activeHomeId,
          name: name.trim(),
          watering_interval: wateringInterval,
          replanting_interval: replantingInterval,
          last_watered: new Date().toISOString(),
          last_replanted: new Date().toISOString(),
        }
      ]);
    if (error) {
      appToast.error("Something went wrong");
      return;
    }

    onAdd(name.trim(), wateringInterval);
    setName("");
    setWateringInterval(7);
    setReplantingInterval(12);
    onClose();
    appToast.success("Plant added successfully");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--background-overlay)] backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="mb-2 w-[calc(100%-16px)] rounded-b-[58px] rounded-t-[50px] p-6 pb-10"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
            backdropFilter: "blur(40px) saturate(1.8)",
            WebkitBackdropFilter: "blur(40px) saturate(1.8)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-[22px] font-bold text-foreground">Add a plant</h2>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
              style={glassClose}
            >
              <IconXFilled className="h-[18px] w-[18px] text-foreground" />
            </button>
          </div>

          {/* Photo identification row */}
          
          <div className="space-y-1">
            {/* Name row */}
            <ListCell
              icon={<IconPencilFilled className="h-5 w-5 text-primary" />}
              title="Name"
              right={{ type: "input", value: name, onChange: (v) => setName(v), placeholder: "Write here" }}
            />

            {/* Watering interval row */}
            <ListCell
              icon={<IconDropletFilled className="h-5 w-5 text-primary" />}
              title="Watering interval"
              right={{
                type: "select",
                options: WATERING_OPTIONS.map((opt) => ({ value: opt, label: `${opt} days` })),
                value: wateringInterval,
                displayValue: `${wateringInterval} days`,
                onChange: (v) => setWateringInterval(Number(v)),
              }}
            />

            {/* Replanting interval row */}
            <ListCell
              icon={<IconCalendarWeekFilled className="h-5 w-5 text-primary" />}
              title="Replant in"
              right={{
                type: "select",
                options: REPLANTING_OPTIONS.map((opt) => ({ value: opt, label: `${opt} months` })),
                value: replantingInterval,
                displayValue: `${replantingInterval} months`,
                onChange: (v) => setReplantingInterval(Number(v)),
              }}
            />
          </div>

          <div className="mt-6">
            <ButtonLarge onClick={handleSubmit}>
              Add plant
            </ButtonLarge>
          </div>
        </motion.div>
      </motion.div>

    </>
  );
};

export default ComponentAddPlantDialog;
