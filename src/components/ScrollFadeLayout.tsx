import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ComponentScrollFadeLayout = ({ children }: { children: ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Debug: measured px value of env(safe-area-inset-top) on the real device.
  // Shown only when the URL ends in #safedebug, so we can confirm whether iOS
  // is actually reporting the inset. Harmless in normal use.
  const [debug, setDebug] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (window.location.hash.includes("safedebug")) {
      // Probe the real computed value of env(safe-area-inset-top).
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;top:0;height:env(safe-area-inset-top,0px);width:0;visibility:hidden;";
      document.body.appendChild(probe);
      const px = probe.getBoundingClientRect().height;
      document.body.removeChild(probe);
      setDebug(
        `safe-top=${px}px | standalone=${
          window.matchMedia("(display-mode: standalone)").matches
        } | ${window.innerWidth}x${window.innerHeight}`,
      );
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Solid safe-area cover — portaled to document.body so it stays pinned
          to the viewport top despite PageTransition's transform (a transform
          on an ancestor re-anchors position:fixed to that ancestor). z-30
          keeps it below the tab bar (z-40) and bottom sheets (z-50). */}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed left-0 right-0 top-0 z-30 bg-background"
            style={{ height: "env(safe-area-inset-top, 0px)" }}
          />,
          document.body,
        )}
      {/* Top fade below the safe area — appears only when scrolled. */}
      <div
        className="pointer-events-none fixed left-0 right-0 z-30 h-16 bg-gradient-to-b from-background to-transparent transition-opacity duration-300"
        style={{ top: "env(safe-area-inset-top, 0px)", opacity: scrolled ? 1 : 0 }}
      />
      {/* Bottom fade — always visible. */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 h-24 bg-gradient-to-t from-background to-transparent" />

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
