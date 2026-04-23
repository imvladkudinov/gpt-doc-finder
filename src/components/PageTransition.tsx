import { motion } from "framer-motion";
import { ReactNode } from "react";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.99,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  duration: 0.35,
};

const ComponentPageTransition = ({ children, className, duration, ease }: { children: ReactNode; className?: string; duration?: number; ease?: string | number[] }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ ...pageTransition, duration: duration ?? pageTransition.duration, ...(ease ? { ease } : {}) }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ComponentPageTransition;
