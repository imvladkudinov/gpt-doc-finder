import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GlassBackButtonProps {
  to?: string;
}

const ComponentGlassBackButton = ({ to }: GlassBackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="glass-heavy flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
    >
      <ChevronLeft className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
    </button>
  );
};

export default ComponentGlassBackButton;
