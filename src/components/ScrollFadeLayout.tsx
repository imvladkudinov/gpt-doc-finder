import { ReactNode, useEffect, useState } from "react";

const ScrollFadeLayout = ({ children }: { children: ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 z-30 h-16 bg-gradient-to-b from-background to-transparent transition-opacity duration-300"
        style={{ opacity: scrolled ? 1 : 0 }}
      />
      {children}
    </div>
  );
};

export default ScrollFadeLayout;
