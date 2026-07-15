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

  // ALL overlays are portaled to document.body. They are position:fixed and
  // must stay pinned to the viewport, but every page nests this layout inside
  // PageTransition, whose framer-motion div keeps a CSS transform applied. A
  // transform on any ancestor re-anchors descendant position:fixed to that
  // ancestor, so in-layout overlays scroll away with the content. Portaling
  // escapes the transformed subtree. z-30 keeps them below the tab bar (z-40)
  // and bottom sheets (z-50).
  //
  // Height/offset use CSS env(safe-area-inset-top) directly (not a JS-measured
  // snapshot) so they self-correct the instant WebKit recomputes the inset.
  // iOS standalone PWAs report 0 for env() on cold launch until a viewport
  // recompute occurs — forceSafeAreaRecalc() in main.tsx triggers that at
  // startup so the cover appears immediately instead of only after a toast.
  const overlays = (
    <>
      {/* Solid safe-area cover (status bar / dynamic island) — always visible,
          static, painted with the app background color regardless of scroll. */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-30 bg-background"
        style={{ height: "env(safe-area-inset-top, 0px)" }}
      />
      {/* Top fade below the safe area — appears only when scrolled. */}
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
