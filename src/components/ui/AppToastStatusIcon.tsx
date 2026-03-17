import { CircleAlert, CircleCheck, Info } from "lucide-react";

type AppToastStatusIconProps = {
  variant: "success" | "error" | "info";
};

const AppToastStatusIcon = ({ variant }: AppToastStatusIconProps) => {
  if (variant === "success") {
    return <CircleCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-icon-primary" strokeWidth={2.5} />;
  }

  if (variant === "error") {
    return <CircleAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-icon-error" strokeWidth={2.5} />;
  }

  return <Info aria-hidden="true" className="h-5 w-5 shrink-0 text-icon-secondary" strokeWidth={2.5} />;
};

export default AppToastStatusIcon;
