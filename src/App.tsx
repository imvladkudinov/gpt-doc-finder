import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Onboarding from "./pages/Onboarding";
import Plants from "./pages/Plants";
import ConnectedServices from "./pages/ConnectedServices";
import CalendarPage from "./pages/Calendar";
import Profile from "./pages/Profile";
import NotificationPreferences from "./pages/NotificationPreferences";
import PlantPersonalization from "./pages/PlantPersonalization";
import NotFound from "./pages/NotFound";
import TabBar from "./components/TabBar";

const queryClient = new QueryClient();

const TAB_PATHS = ["/plants", "/calendar", "/profile", "/connected-services", "/notification-preferences"];

const AnimatedRoutes = () => {
  const location = useLocation();
  const showTabBar = TAB_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Onboarding />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/connected-services" element={<ConnectedServices />} />
          <Route path="/notification-preferences" element={<NotificationPreferences />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {showTabBar && <TabBar />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
