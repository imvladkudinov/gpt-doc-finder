import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ComponentScrollFadeLayout = ({ children }: { children: ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen">
      {createPortal(
        <>
          {/* Solid safe-area cover (status bar / dynamic island) - always visible.
              Portaled to body so it stays pinned to the real viewport even when
              PageTransition's motion.div applies a transform to its ancestors
              (a transform turns descendant `fixed` into relative-to-ancestor). */}
          <div
            className="pointer-events-none fixed left-0 right-0 z-30 bg-background"
            style={{
              top: "calc(0px - env(safe-area-inset-top, 0px))",
              height: "env(safe-area-inset-top, 0px)",
            }}
          />
          {/* Top fade below the safe area */}
          <div
            className="pointer-events-none fixed left-0 right-0 z-30 h-16 bg-gradient-to-b from-background to-transparent transition-opacity duration-300"
            style={{
              top: 0,
              opacity: scrolled ? 1 : 0,
            }}
          />
          {/* Bottom fade - always visible */}
          <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 h-24 bg-gradient-to-t from-background to-transparent" />
        </>,
        document.body,
      )}
      <div className="w-full max-w-[720px] mx-auto">
        {children}
      </div>
    </div>
  );
};

export default ComponentScrollFadeLayout;
