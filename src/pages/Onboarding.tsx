import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";
import plantsHero from "@/assets/plants-hero.png";
import { Leaf } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="flex min-h-screen flex-col items-center justify-between bg-background px-6 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <motion.img
          src={plantsHero}
          alt="Beautiful houseplants illustration"
          className="mb-8 h-56 w-56 object-contain"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <h1 className="mb-3 font-serif text-3xl font-bold tracking-tight text-foreground">
          Never forget your plants again
        </h1>
        <p className="max-w-xs text-base text-muted-foreground">
          Smart watering reminders that adapt to your life. Start caring in under 30 seconds.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm space-y-3"
      >
        <button
          onClick={() => navigate("/plants")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Leaf className="h-5 w-5" />
          Sign in to start caring effortlessly
        </button>

        <button
          onClick={() => navigate("/plants")}
          className="w-full rounded-2xl px-6 py-4 font-medium text-muted-foreground transition-all hover:bg-secondary active:scale-[0.98]"
        >
          Skip setup — we'll handle it for you
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Your plants, stress-free 🌿
        </p>
      </motion.div>
    </div>
    </PageTransition>
  );
};

export default Onboarding;
