import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ButtonLow } from "@/components/ui/ButtonLow";

const PageNotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-0">Page not found</h1>
      <p className="text-body pb-[16px]">Try reload page or return home</p>
      <ButtonLow variant="primary" onClick={() => window.location.href = "/"}>Return to Home</ButtonLow>
    </div>
  );
};

export default PageNotFound;
