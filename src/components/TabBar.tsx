import { IconLeafFilled, IconUserFilled } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { prefetchRoute } from "@/lib/route-prefetch";

const tabs = [
  { path: "/plants", matchPaths: ["/plants"], icon: IconLeafFilled },
  { path: "/profile", matchPaths: [
    "/profile",
    "/personal-details",
    "/homes",
    "/notification-preferences",
    "/legal",
    "/legal/terms",
    "/legal/policy"
  ], icon: IconUserFilled },
];

const ComponentTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-6" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
      <nav
        className="glass-floating flex items-center gap-1 rounded-full px-1 py-1"
      >
        {tabs.map(({ path, matchPaths, icon: Icon }) => {
          const active = matchPaths.some((p) => location.pathname.startsWith(p));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              onMouseEnter={() => prefetchRoute(path)}
              onFocus={() => prefetchRoute(path)}
              onTouchStart={() => prefetchRoute(path)}
              className="relative flex h-12 w-14 items-center justify-center rounded-full transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="tab-active"
                  className="glass-floating-active absolute inset-0 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`relative z-10 h-5 w-5 transition-all duration-200 ${
                  active ? "text-icon-primary" : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2 : 1.6}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ComponentTabBar;
