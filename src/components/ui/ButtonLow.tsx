import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonLowProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "error";
  className?: string;
}

export const ButtonLow = React.forwardRef<HTMLButtonElement, ButtonLowProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const { style, ...rest } = props as any;
    const mergedStyle = { ...(style || {}), letterSpacing: '2%' };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-11 min-w-0 items-center justify-center overflow-hidden rounded-full px-3 text-sm font-bold transition-colors",
          "hover:opacity-90",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary"
            ? "bg-control-primary text-text-primary-control"
            : variant === "error"
            ? "bg-control-error text-text-control-error"
            : "bg-control-secondary text-text-secondary-control",
          className,
        )}
        style={mergedStyle}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

ButtonLow.displayName = "ButtonLow";
