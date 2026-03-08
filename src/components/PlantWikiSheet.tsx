import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, Search } from "lucide-react";

interface WikiTopic {
  title: string;
  content: string;
}

const WIKI_TOPICS: WikiTopic[] = [
  {
    title: "How often should I water my plants?",
    content:
      "Most houseplants prefer to dry out slightly between waterings. Stick your finger about an inch into the soil — if it feels dry, it's time to water. Overwatering is the #1 killer of indoor plants. Succulents and cacti need water every 2–3 weeks, while tropical plants like ferns may need it every 3–5 days. Always adjust based on season: plants drink less in winter.",
  },
  {
    title: "Understanding light requirements",
    content:
      "Bright indirect light suits most houseplants — think a spot near a window with a sheer curtain. Direct sun can scorch leaves of shade-loving species like Calathea and Pothos. South-facing windows provide the most light; north-facing the least. If your plant is leggy or pale, it probably needs more light. Rotate plants quarterly for even growth.",
  },
  {
    title: "When and how to repot",
    content:
      "Repot when roots circle the bottom of the pot, water runs straight through, or growth has stalled. Choose a pot only 1–2 inches larger in diameter. Use fresh potting mix appropriate for the species. Spring is the best time to repot because plants are entering their active growth phase. Water thoroughly after repotting and avoid fertilising for 2–4 weeks.",
  },
  {
    title: "Dealing with yellow leaves",
    content:
      "Yellow leaves can signal overwatering, underwatering, nutrient deficiency, or too much direct sun. Check the soil first: soggy means too much water; bone-dry means too little. If watering is fine, consider feeding with a balanced liquid fertiliser. Old lower leaves naturally yellow and drop — that's normal. Sudden mass yellowing often points to root rot.",
  },
  {
    title: "Humidity tips for tropical plants",
    content:
      "Many popular houseplants — Monstera, Calathea, Ferns — originate from humid tropical forests. Aim for 50–70% humidity. Group plants together to create a micro-climate, use a pebble tray with water, or run a humidifier nearby. Misting provides only temporary relief and can encourage fungal issues if done excessively. Bathrooms and kitchens are naturally more humid rooms.",
  },
  {
    title: "Fertilising basics",
    content:
      "Feed houseplants during the growing season (spring and summer) with a balanced liquid fertiliser diluted to half strength, roughly every 2–4 weeks. Stop fertilising in autumn and winter when growth slows. Over-fertilising causes salt build-up and brown leaf tips. Freshly repotted plants don't need fertiliser for at least a month since fresh soil contains nutrients.",
  },
  {
    title: "Common pests and how to treat them",
    content:
      "Spider mites, mealybugs, fungus gnats, and scale are the most common indoor plant pests. Inspect new plants before bringing them home. Wipe leaves with a damp cloth regularly. For infestations, isolate the plant and treat with neem oil or insecticidal soap. Sticky yellow traps work well for fungus gnats. Consistent care and good airflow are the best prevention.",
  },
  {
    title: "Propagation for beginners",
    content:
      "Many houseplants are easy to propagate. Pothos, Philodendron, and Monstera can be rooted in water from stem cuttings — just cut below a node. Succulents propagate from leaf cuttings laid on dry soil. Snake Plants can be divided at the root. Spring and early summer give the highest success rates. Change water every few days for water propagation.",
  },
  {
    title: "Seasonal care calendar",
    content:
      "Spring: Resume regular watering and fertilising, repot if needed, prune leggy growth. Summer: Water more frequently, shield from intense afternoon sun, watch for pests. Autumn: Gradually reduce watering and stop fertilising, move plants away from cold drafts. Winter: Water sparingly, increase humidity if heating dries the air, avoid repotting. Most plants are semi-dormant in winter.",
  },
  {
    title: "Choosing the right soil mix",
    content:
      "Standard potting mix works for most foliage plants. Succulents and cacti need a gritty, fast-draining mix (add perlite or coarse sand). Orchids require bark-based media. Aroids like Monstera love chunky, airy mixes with bark, perlite, and coco coir. Never use garden soil indoors — it compacts, drains poorly, and may harbour pests. Always ensure pots have drainage holes.",
  },
];

interface PlantWikiSheetProps {
  open: boolean;
  onClose: () => void;
}

const PlantWikiSheet = ({ open, onClose }: PlantWikiSheetProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!open) return null;

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
        className="w-full max-w-md rounded-t-3xl bg-card p-6 pb-10 max-h-[85vh] overflow-y-auto"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">
              Plant Wiki
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Essential tips for happy, healthy houseplants
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-95"
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

        <div className="space-y-2">
          {WIKI_TOPICS.map((topic, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div key={i} className="rounded-2xl bg-secondary overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 transition-colors active:bg-secondary/80"
                >
                  <span className="text-sm font-medium text-foreground text-left pr-3">
                    {topic.title}
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                        {topic.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlantWikiSheet;
