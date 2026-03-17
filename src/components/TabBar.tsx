import { IconLeafFilled, IconUserFilled } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { path: "/plants", matchPaths: ["/plants"], icon: IconLeafFilled },
  { path: "/profile", matchPaths: ["/profile", "/personal-details", "/homes"], icon: IconUserFilled },
];

const ComponentTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-6">
      <nav
        className="flex items-center gap-1 rounded-full px-1 py-1"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.25) 100%)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >
        {tabs.map(({ path, matchPaths, icon: Icon }) => {
          const active = matchPaths.some((p) => location.pathname.startsWith(p));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative flex h-12 w-14 items-center justify-center rounded-full transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="tab-active"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%)",
                    border: "1px solid rgba(255,255,255,0.55)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)",
                  }}
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
