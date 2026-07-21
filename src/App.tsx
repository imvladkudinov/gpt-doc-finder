import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import React, { Suspense } from "react";
const AppToaster = React.lazy(() =>
  import("@/components/ui/sonner").then((module) => ({ default: module.Toaster })),
);
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
const AppTabBar = React.lazy(() => import("./components/TabBar"));
import { supabase } from "@/integrations/supabase/client";
import ErrorBoundary from "@/components/ErrorBoundary";
import { prefetchRoutes } from "@/lib/route-prefetch";

const queryClient = new QueryClient();

/**
 * Read the persisted Supabase session synchronously from localStorage.
 *
 * supabase-js only exposes getSession() as async, and on iOS PWAs that call can
 * stall: it serializes auth-token access behind the Web Locks API
 * (navigator.locks), and a lock held by a previously-killed webview context is
 * never released — so getSession() hangs and the app sits on a blank auth gate
 * until something jostles it (which is why switching pages "unsticks" it).
 *
 * The session is already sitting in localStorage though (persistSession: true),
 * so we read it directly for the very first render instead of blocking on the
 * stalling call. The async flow below still runs to verify/correct state.
 * Returns null on any problem, which simply falls back to the old behavior.
 */
const readStoredSession = (): Session | null => {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !/^sb-.*-auth-token$/.test(key)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const candidate = parsed?.access_token ? parsed : parsed?.currentSession ?? null;
      if (candidate?.access_token && candidate?.user) return candidate as Session;
    }
  } catch {
    // Malformed or inaccessible storage — fall back to the async auth flow.
  }
  return null;
};

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
      {showTabBar ? (
        <Suspense fallback={null}>
          <AppTabBar />
        </Suspense>
      ) : null}
    </>
  );
};
const App = () => {
  const [session, setSession] = useState<Session | null>(readStoredSession);
  // If a session was restored synchronously from storage, we can render the
  // app immediately instead of blocking on the (potentially stalling) async
  // getSession() call.
  const [loading, setLoading] = useState<boolean>(session === null);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let initialResolved = false;

    const markInitialResolved = () => {
      if (initialResolved || !isMounted) return;
      initialResolved = true;
      setLoading(false);
    };

    // The session was already restored synchronously from storage, so the
    // initial gate is satisfied — no need to wait on getSession() below.
    if (readStoredSession()) {
      markInitialResolved();
    }

    // Watchdog: never let the auth gate hang. If getSession() stalls on the
    // navigator.locks issue, force the gate open after a short delay so the
    // shell renders regardless; the async flow still corrects state when it
    // eventually resolves.
    const watchdogId = window.setTimeout(markInitialResolved, 2000);

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

    const applySessionWithoutBlocking = (nextSession: Session | null) => {
      if (!isMounted) return;
      setSession(nextSession);
    };

    const hydrateAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;

      if (!currentSession) {
        markInitialResolved();
        return;
      }

      applySessionWithoutBlocking(currentSession);
      markInitialResolved();
      void applySessionWithVerification(currentSession);
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
      window.clearTimeout(watchdogId);
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
        <Suspense fallback={null}>
          <AppToaster position="top-center" />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
