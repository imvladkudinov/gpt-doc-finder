import React from "react";
import { useNavigate } from "react-router-dom";
import { ButtonLarge } from "@/components/ui/ButtonLarge";
import { ButtonLow } from "@/components/ui/ButtonLow";
import GlassBackButton from "@/components/GlassBackButton";

const HomeIcon = () => (
  <img src="/home-icon.png" alt="Planty icon" className="w-[120px] h-[120px] mx-auto" />
);

const PageHome = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/plants", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-background">
      <div className="flex-1 flex flex-col justify-center items-center">
        <HomeIcon />
        <h1 className="mt-[8px] text-[28px] font-title font-bold text-foreground">Planty</h1>
        <p className="mt-0 mb-0 text-[16px] text-muted-foreground text-center">Treat your plants the way they deserve</p>
        <ButtonLow
          className="mt-[16px]"
          variant="primary"
          onClick={() => navigate("/auth")}
        >
          Start
        </ButtonLow>
      </div>
      <div className="flex flex-row justify-center gap-8 mb-6">
        <button
          className="text-[12px] font-body font-bold text-primary bg-transparent border-none p-0 opacity-50"
          onClick={() => navigate("/legal/terms")}
        >
          Terms
        </button>
        <button
          className="text-[12px] font-body font-bold text-primary bg-transparent border-none p-0 opacity-50"
          onClick={() => navigate("/legal/policy")}
        >
          Policy
        </button>
      </div>
    </div>
  );
};

export default PageHome;
