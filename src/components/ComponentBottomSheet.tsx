import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ComponentBottomSheetProps {
  children: ReactNode;
  onClose: () => void;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  sheetClassName?: string;
  sheetStyle?: CSSProperties;
}

const sheetBaseStyle: CSSProperties = {
  maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 16px)",
};

const ComponentBottomSheet = ({
  children,
  onClose,
  overlayClassName,
  overlayStyle,
  sheetClassName,
  sheetStyle,
}: ComponentBottomSheetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed left-0 right-0 z-50 flex items-end justify-center bg-[var(--background-overlay)] backdrop-blur-sm",
        overlayClassName,
      )}
      style={{ top: 0, bottom: 0, ...overlayStyle }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "glass-heavy mb-2 w-[calc(100%-16px)] max-w-[720px] rounded-b-[58px] rounded-t-[50px] p-6 pb-7 overflow-y-auto",
          sheetClassName,
        )}
        style={{ ...sheetBaseStyle, ...sheetStyle }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ComponentBottomSheet;
