import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PROJECT_THEME_TOKENS } from "@/data/themeTokens";
import { applyTokensToRoot } from "@/lib/theme-tokens";

applyTokensToRoot(PROJECT_THEME_TOKENS);

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
