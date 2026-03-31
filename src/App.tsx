import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Plants from "./pages/Plants";
import Profile from "./pages/Profile";
import PersonalDetails from "./pages/PersonalDetails";
import NotificationPreferences from "./pages/NotificationPreferences";
import Homes from "./pages/Homes";
import HomeDetails from "./pages/HomeDetails";
import UIPlayground from "./pages/UIPlayground";
// import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";
import LegalTerms from "./pages/LegalTerms";
import LegalPolicy from "./pages/LegalPolicy";
import PasswordRecovery from "./pages/PasswordRecovery";
import PageHome from "./pages/Home";
import TabBar from "./components/TabBar";
import { supabase } from "@/integrations/supabase/client";
import { clearStoredActiveHomeId, ensureActiveHomeForCurrentUser } from "@/lib/homes";
import { syncCurrentUserProfile } from "@/lib/profiles";
import { ensurePushSubscription } from "@/lib/device-notifications";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const TAB_PATHS = [
  "/plants",
  "/profile",
  "/personal-details",
  "/homes",
  "/notification-preferences",
  "/legal",
  "/legal/terms",
  "/legal/policy"
];

// No longer need ProtectedRoute, all users go to Home

const ProtectedRoute = ({ session, children }: { session: Session | null, children: React.ReactNode }) => {
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AnimatedRoutes = ({ session, loading }: { session: Session | null; loading: boolean }) => {
  const location = useLocation();
  const showTabBar = Boolean(session) && TAB_PATHS.some((p) => location.pathname.startsWith(p));

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageHome />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/legal/terms" element={<LegalTerms />} />
          <Route path="/legal/policy" element={<LegalPolicy />} />
          <Route path="/plants" element={<ProtectedRoute session={session}><Plants /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute session={session}><Profile /></ProtectedRoute>} />
          <Route path="/personal-details" element={<ProtectedRoute session={session}><PersonalDetails /></ProtectedRoute>} />
          <Route path="/notification-preferences" element={<ProtectedRoute session={session}><NotificationPreferences /></ProtectedRoute>} />
          <Route path="/homes" element={<ProtectedRoute session={session}><Homes /></ProtectedRoute>} />
          <Route path="/homes/:homeId" element={<ProtectedRoute session={session}><HomeDetails /></ProtectedRoute>} />
          <Route path="/playground" element={<ProtectedRoute session={session}><UIPlayground /></ProtectedRoute>} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {showTabBar && <TabBar />}
    </>
  );
};
const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AnimatedRoutes session={session} loading={loading} />
          </ErrorBoundary>
        </BrowserRouter>
        <Sonner position="top-center" />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
