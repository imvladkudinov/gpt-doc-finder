import { ReactNode } from "react";

const ScrollFadeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-30 h-16 bg-gradient-to-b from-background to-transparent" />
      {children}
    </div>
  );
};

export default ScrollFadeLayout;
