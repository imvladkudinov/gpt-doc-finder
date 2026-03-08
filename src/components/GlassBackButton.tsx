import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GlassBackButtonProps {
  to?: string;
}

const GlassBackButton = ({ to }: GlassBackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
        backdropFilter: "blur(40px) saturate(1.8)",
        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      <ChevronLeft className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
    </button>
  );
};

export default GlassBackButton;
