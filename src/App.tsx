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
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Legal from "./pages/Legal";
import LegalTerms from "./pages/LegalTerms";
import LegalPolicy from "./pages/LegalPolicy";
import PasswordRecovery from "./pages/PasswordRecovery";
import TabBar from "./components/TabBar";
import { supabase } from "@/integrations/supabase/client";
import { clearStoredActiveHomeId, ensureActiveHomeForCurrentUser } from "@/lib/homes";
import { syncCurrentUserProfile } from "@/lib/profiles";
import { ensurePushSubscription } from "@/lib/device-notifications";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const TAB_PATHS = ["/plants", "/profile", "/personal-details", "/homes"];

const ProtectedRoute = ({ session }: { session: Session | null }) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
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
          <Route path="/auth" element={session ? <Navigate to="/plants" replace /> : <Auth />} />
          <Route element={<ProtectedRoute session={session} />}>
            <Route path="/" element={<Navigate to="/plants" replace />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/personal-details" element={<PersonalDetails />} />
            <Route path="/notification-preferences" element={<NotificationPreferences />} />
            <Route path="/homes" element={<Homes />} />
            <Route path="/homes/:homeId" element={<HomeDetails />} />
            <Route path="/playground" element={<UIPlayground />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/legal/terms" element={<LegalTerms />} />
            <Route path="/legal/policy" element={<LegalPolicy />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
          </Route>
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
      if (data.session) {
        ensureActiveHomeForCurrentUser();
        syncCurrentUserProfile();
        ensurePushSubscription().catch(() => {
          // Keep app startup resilient if push setup fails or permission is denied.
        });
      } else {
        clearStoredActiveHomeId();
      }
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession) {
        ensureActiveHomeForCurrentUser();
        syncCurrentUserProfile();
        ensurePushSubscription().catch(() => {
          // Keep auth flow resilient if push setup fails or permission is denied.
        });
      } else {
        clearStoredActiveHomeId();
      }
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <ErrorBoundary>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AnimatedRoutes session={session} loading={loading} />
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
