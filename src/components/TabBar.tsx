import { Leaf, CalendarDays, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/plants", icon: Leaf, label: "Plants" },
  { path: "/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/profile", icon: User, label: "Profile" },
];

const TabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="glass-subtle fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-4 pb-6 pt-3">
      {tabs.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;
