import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PROJECT_THEME_TOKENS } from "@/data/themeTokens";
import { applyTokensToRoot } from "@/lib/theme-tokens";

applyTokensToRoot(PROJECT_THEME_TOKENS);

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/service-worker.js").catch(() => {
			// Keep startup resilient even if service worker registration fails.
		});
	});
}

createRoot(document.getElementById("root")!).render(<App />);
