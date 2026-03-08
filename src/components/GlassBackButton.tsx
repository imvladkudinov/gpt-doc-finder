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
      className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 backdrop-blur-2xl saturate-150 border border-foreground/[0.08] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] text-foreground/60 transition-all active:scale-95 hover:bg-foreground/[0.08]"
    >
      <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.2} />
    </button>
  );
};

export default GlassBackButton;
