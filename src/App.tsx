import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import React, { Suspense } from "react";
const Plants = React.lazy(() => import("./pages/Plants"));
const Profile = React.lazy(() => import("./pages/Profile"));
const PersonalDetails = React.lazy(() => import("./pages/PersonalDetails"));
const NotificationPreferences = React.lazy(() => import("./pages/NotificationPreferences"));
const Homes = React.lazy(() => import("./pages/Homes"));
const HomeDetails = React.lazy(() => import("./pages/HomeDetails"));
const UIPlayground = React.lazy(() => import("./pages/UIPlayground"));
// const Auth = React.lazy(() => import("./pages/Auth"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Legal = React.lazy(() => import("./pages/Legal"));
const LegalTerms = React.lazy(() => import("./pages/LegalTerms"));
const LegalPolicy = React.lazy(() => import("./pages/LegalPolicy"));
const PasswordRecovery = React.lazy(() => import("./pages/PasswordRecovery"));
const PageHome = React.lazy(() => import("./pages/Home"));
import TabBar from "./components/TabBar";
import { supabase } from "@/integrations/supabase/client";
import ErrorBoundary from "@/components/ErrorBoundary";
import { prefetchRoutes } from "@/lib/route-prefetch";

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
          <Route path="/" element={session ? <Navigate to="/plants" replace /> : <PageHome />} />
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
    let initialResolved = false;

    const markInitialResolved = () => {
      if (initialResolved || !isMounted) return;
      initialResolved = true;
      setLoading(false);
    };

    const applySessionWithVerification = async (nextSession: Session | null) => {
      if (!nextSession) {
        if (!isMounted) return;
        setSession(null);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        await supabase.auth.signOut({ scope: "local" });
        if (!isMounted) return;
        setSession(null);
        return;
      }

      if (!isMounted) return;
      setSession(nextSession);
    };

    const hydrateAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;

      if (!currentSession) {
        // Give auth state listener a short chance to restore session in PWA context.
        window.setTimeout(() => {
          markInitialResolved();
        }, 250);
        return;
      }

      await applySessionWithVerification(currentSession);
      markInitialResolved();
    };

    hydrateAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void (async () => {
        await applySessionWithVerification(nextSession);
        markInitialResolved();
      })();
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    const timer = window.setTimeout(() => {
      prefetchRoutes([
        "/plants",
        "/profile",
        "/homes",
        "/notification-preferences",
        "/personal-details",
        "/legal",
      ]);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [session]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <AnimatedRoutes session={session} loading={loading} />
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
        <Sonner position="top-center" />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
