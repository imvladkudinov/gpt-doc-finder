import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonLargeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export const ButtonLarge = React.forwardRef<HTMLButtonElement, ButtonLargeProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-[52px] w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary"
            ? "bg-control-primary text-text-primary-control hover:opacity-90"
            : "bg-control-secondary text-text-secondary-control hover:opacity-90",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

ButtonLarge.displayName = "ButtonLarge";
