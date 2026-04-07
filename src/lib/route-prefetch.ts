const routeLoaders = {
  "/": () => import("@/pages/Home"),
  "/plants": () => import("@/pages/Plants"),
  "/profile": () => import("@/pages/Profile"),
  "/personal-details": () => import("@/pages/PersonalDetails"),
  "/notification-preferences": () => import("@/pages/NotificationPreferences"),
  "/homes": () => import("@/pages/Homes"),
  "/homes/:homeId": () => import("@/pages/HomeDetails"),
  "/playground": () => import("@/pages/UIPlayground"),
  "/legal": () => import("@/pages/Legal"),
  "/legal/terms": () => import("@/pages/LegalTerms"),
  "/legal/policy": () => import("@/pages/LegalPolicy"),
  "/password-recovery": () => import("@/pages/PasswordRecovery"),
  "*": () => import("@/pages/NotFound"),
} as const;

type PrefetchableRoute = keyof typeof routeLoaders;

const prefetchedRoutes = new Set<PrefetchableRoute>();

const normalizeRoute = (path: string): PrefetchableRoute | null => {
  if (!path) return null;
  if (path.startsWith("/homes/")) return "/homes/:homeId";

  const direct = path as PrefetchableRoute;
  if (direct in routeLoaders) {
    return direct;
  }

  return null;
};

export const prefetchRoute = (path: string) => {
  const normalized = normalizeRoute(path);
  if (!normalized || prefetchedRoutes.has(normalized)) return;

  prefetchedRoutes.add(normalized);
  routeLoaders[normalized]().catch(() => {
    prefetchedRoutes.delete(normalized);
  });
};

export const prefetchRoutes = (paths: string[]) => {
  for (const path of paths) {
    prefetchRoute(path);
  }
};
