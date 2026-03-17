// Get CSS token value from root
function getControlPrimary() {
  if (typeof window === "undefined") return "#2f5f3a";
  return getComputedStyle(document.documentElement).getPropertyValue("--control-primary") || "#2f5f3a";
}

export const ComponentMobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useDeviceType();
  const [bg, setBg] = React.useState("#2f5f3a");
  React.useEffect(() => {
    setBg(getControlPrimary());
  }, []);

  if (isMobile) {
    return <>{children}</>;
  }
  // Desktop: show fixed frame
  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 390,
          height: 820,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow: "0 0 32px rgba(0,0,0,0.16)",
          background: "#fff",
          border: "4px solid #2f5f3a",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
};
