import { Leaf, CalendarDays, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { path: "/plants", icon: Leaf },
  { path: "/calendar", icon: CalendarDays },
  { path: "/profile", icon: User },
];

const TabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-6">
      <nav className="flex items-center gap-2 rounded-full bg-foreground/5 p-1.5 backdrop-blur-2xl saturate-150 border border-foreground/[0.08] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
        {tabs.map(({ path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="tab-active"
                  className="absolute inset-0 rounded-full bg-foreground/[0.08] backdrop-blur-md border border-foreground/[0.06]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`relative z-10 h-[18px] w-[18px] transition-colors ${
                  active ? "text-foreground" : "text-foreground/35"
                }`}
                strokeWidth={active ? 2.2 : 1.8}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabBar;
