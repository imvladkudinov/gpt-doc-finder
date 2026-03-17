import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ className, selected = false, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
        selected
          ? "bg-control-primary text-text-primary-control"
          : "bg-control-secondary text-text-secondary-control",
        className,
      )}
      {...props}
    />
  ),
);

Tab.displayName = "Tab";
