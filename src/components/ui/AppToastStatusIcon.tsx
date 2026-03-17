import { IconCircleCheckFilled, IconAlertCircleFilled, IconInfoCircleFilled } from "@tabler/icons-react";

type AppToastStatusIconProps = {
  variant: "success" | "error" | "info";
};

const AppToastStatusIcon = ({ variant }: AppToastStatusIconProps) => {
  if (variant === "success") {
    return <IconCircleCheckFilled aria-hidden="true" className="h-5 w-5 shrink-0 text-icon-primary" />;
  }

  if (variant === "error") {
    return <IconAlertCircleFilled aria-hidden="true" className="h-5 w-5 shrink-0 text-icon-error" />;
  }

  return <IconInfoCircleFilled aria-hidden="true" className="h-5 w-5 shrink-0 text-icon-secondary" />;
};

export default AppToastStatusIcon;
