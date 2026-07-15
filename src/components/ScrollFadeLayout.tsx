import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Measures env(safe-area-inset-top) via a probe element instead of trusting
// the live CSS value directly. On some WebKit/iOS PWA cold launches,
// env(safe-area-inset-top) reports 0 on first paint and only recalculates
// after a later reflow (e.g. a toast mounting) — so components that inline
// `env(...)` into style can end up with a stuck 0px height. Measuring in JS
// and re-checking a few times after mount works around that.
const measureSafeAreaTop = () => {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;height:env(safe-area-inset-top,0px);width:0;visibility:hidden;";
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  document.body.removeChild(probe);
  return px;
};

const ComponentScrollFadeLayout = ({ children }: { children: ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [safeTop, setSafeTop] = useState(0);
  const [debug, setDebug] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    const refresh = () => {
      const px = measureSafeAreaTop();
      setSafeTop(px);
      if (standalone || window.location.hash.includes("safedebug")) {
        setDebug(`safe-top=${px}px | standalone=${standalone} | ${window.innerWidth}x${window.innerHeight}`);
      }
    };

    refresh();
    // Re-measure shortly after mount to catch the case where env() was 0 on
    // first paint and only updates after a later reflow.
    const retryTimers = [100, 300, 800, 1500].map((ms) => window.setTimeout(refresh, ms));
    window.addEventListener("resize", refresh);
    window.addEventListener("orientationchange", refresh);
    window.addEventListener("pageshow", refresh);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("orientationchange", refresh);
      window.removeEventListener("pageshow", refresh);
      retryTimers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // ALL overlays are portaled to document.body. They are position:fixed and
  // must stay pinned to the viewport, but every page nests this layout inside
  // PageTransition, whose framer-motion div keeps a CSS transform applied. A
  // transform on any ancestor re-anchors descendant position:fixed to that
  // ancestor, so in-layout overlays scroll away with the content. Portaling
  // escapes the transformed subtree. z-30 keeps them below the tab bar (z-40)
  // and bottom sheets (z-50).
  const overlays = (
    <>
      {/* Solid safe-area cover (status bar / dynamic island). Height is the
          JS-measured safe-area inset (see measureSafeAreaTop above), not a
          live CSS env() reference — always visible, static. */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-30 bg-background"
        style={{ height: safeTop }}
      />
      {/* Top fade below the safe area — appears only when scrolled. */}
      <div
        className="pointer-events-none fixed left-0 right-0 z-30 h-16 bg-gradient-to-b from-background to-transparent transition-opacity duration-300"
        style={{ top: safeTop, opacity: scrolled ? 1 : 0 }}
      />
      {/* Bottom fade — always visible. */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 h-24 bg-gradient-to-t from-background to-transparent" />
    </>
  );

  return (
    <div className="relative min-h-screen">
      {mounted && createPortal(overlays, document.body)}

      {debug && (
        <div className="pointer-events-none fixed left-2 bottom-24 z-[999] rounded bg-black/80 px-2 py-1 text-[11px] font-mono text-white">
          {debug}
        </div>
      )}

      <div className="w-full max-w-[720px] mx-auto">
        {children}
      </div>
    </div>
  );
};

export default ComponentScrollFadeLayout;
