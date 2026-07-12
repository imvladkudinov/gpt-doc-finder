import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ComponentScrollFadeLayout = ({ children }: { children: ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);
  // Portal target. The overlays MUST be rendered outside this component's
  // subtree: an ancestor (PageTransition's framer-motion div) keeps a CSS
  // transform applied, and a transform on any ancestor makes descendant
  // `position: fixed` elements anchor to that ancestor instead of the
  // viewport — so the status-bar cover would drift and scroll away.
  // Rendering into document.body pins the overlays to the real viewport.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlays = (
    <>
      {/* Solid safe-area cover (status bar / dynamic island) — always visible,
          static, painted with the app background regardless of scroll. */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[60] bg-background"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
      />
      {/* Top fade below the safe area — appears only when scrolled. */}
      <div
        className="pointer-events-none fixed left-0 right-0 z-[55] h-16 bg-gradient-to-b from-background to-transparent transition-opacity duration-300"
        style={{ top: "env(safe-area-inset-top, 0px)", opacity: scrolled ? 1 : 0 }}
      />
      {/* Bottom fade — always visible. */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[55] h-24 bg-gradient-to-t from-background to-transparent" />
    </>
  );

  return (
    <div className="relative min-h-screen">
      {mounted && createPortal(overlays, document.body)}
      <div className="w-full max-w-[720px] mx-auto">
        {children}
      </div>
    </div>
  );
};

export default ComponentScrollFadeLayout;
