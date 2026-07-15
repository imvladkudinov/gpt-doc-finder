import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ComponentScrollFadeLayout = ({ children }: { children: ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Overlays are portaled to document.body so they escape PageTransition's
  // CSS transform (any transformed ancestor re-anchors position:fixed children
  // to itself, causing them to scroll away with the content).
  //
  // The safe area (status bar / Dynamic Island) is covered by the body's own
  // bg-background — iOS extends the body background behind the status bar
  // whenever viewport-fit=cover is set. No separate solid div is needed, and
  // relying on one would break on cold launch because env(safe-area-inset-top)
  // reads 0 until WebKit recomputes it.
  const overlays = (
    <>
      {/* Top fade — appears only when scrolled, starts below the safe area.
          When env() is 0 on cold launch it sits at top:0 which is still fine:
          the gradient from-background covers the safe area with the right color. */}
      <div
        className="pointer-events-none fixed left-0 right-0 z-30 h-16 bg-gradient-to-b from-background to-transparent transition-opacity duration-300"
        style={{ top: "env(safe-area-inset-top, 0px)", opacity: scrolled ? 1 : 0 }}
      />
      {/* Bottom fade — always visible. */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 h-24 bg-gradient-to-t from-background to-transparent" />
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
