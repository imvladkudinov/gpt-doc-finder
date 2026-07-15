import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PROJECT_THEME_TOKENS } from "@/data/themeTokens";
import { applyTokensToRoot } from "@/lib/theme-tokens";

applyTokensToRoot(PROJECT_THEME_TOKENS);

// iOS standalone PWAs report env(safe-area-inset-*) as 0 on cold launch and
// only recompute after a viewport/compositing change (e.g. the first toast
// mounting). Toggling viewport-fit off and back on forces WebKit to recompute
// the safe-area insets, so env()-based UI (the status-bar cover) resolves to
// its real value immediately instead of only after a toast appears.
const forceSafeAreaRecalc = () => {
	const vp = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
	if (!vp) return;
	const content = vp.getAttribute("content") ?? "";
	if (!content.includes("viewport-fit=cover")) return;
	const stripped = content.replace(/,?\s*viewport-fit=cover/, "");
	vp.setAttribute("content", stripped);
	// Force a synchronous style/layout flush so the change actually takes effect.
	void document.documentElement.offsetHeight;
	requestAnimationFrame(() => {
		vp.setAttribute("content", content);
	});
};

// Run once the DOM is ready, and again when the app resumes from the background
// (standalone PWAs frequently reset the insets to 0 on resume).
window.addEventListener("load", () => forceSafeAreaRecalc());
window.addEventListener("pageshow", () => forceSafeAreaRecalc());
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible") forceSafeAreaRecalc();
});

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		if (import.meta.env.PROD) {
			navigator.serviceWorker.register("/service-worker.js").catch(() => {
				// Keep startup resilient even if service worker registration fails.
			});
			return;
		}

		void navigator.serviceWorker.getRegistrations().then((registrations) => {
			for (const registration of registrations) {
				void registration.unregister();
			}
		});

		if ("caches" in window) {
			void caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
		}
	});
}

createRoot(document.getElementById("root")!).render(
	<App />
);
