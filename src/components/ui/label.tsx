import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface LabelOption<Value extends string | number = string | number> {
  value: Value;
  label: string;
}

interface LabelBaseProps {
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface LabelStaticProps extends React.HTMLAttributes<HTMLElement>, LabelBaseProps {
  mode?: "static";
  children: React.ReactNode;
  asChild?: boolean;
  options?: never;
  value?: never;
  displayValue?: never;
  onChange?: never;
}

interface LabelSelectorProps extends LabelBaseProps {
  mode: "select";
  children?: never;
  asChild?: never;
  /** List of options for selector mode. */
  options: LabelOption[];
  value: string | number;
  displayValue: string;
  onChange: (value: string | number) => void;
}

export type LabelProps = LabelStaticProps | LabelSelectorProps;

export const Label = ({ mode = "static", className, disabled, style, ...rest }: LabelProps) => {
  if (mode === "select") {
    const { options, value, displayValue, onChange } = rest as LabelSelectorProps;
    return (
      <div className={className} style={{ position: "relative", display: "inline-block", ...style }}>
        <span
          className={cn(
            "inline-flex items-center rounded-[8px] bg-control-secondary px-3 py-1.5 text-sm font-semibold text-text-secondary-control cursor-pointer",
            disabled && "opacity-60 pointer-events-none",
          )}
          aria-hidden
        >
          {displayValue}
        </span>
        <select
          value={String(value)}
          onChange={(e) => {
            const next = options.find((o) => String(o.value) === e.target.value);
            if (next) onChange(next.value);
          }}
          disabled={disabled}
          className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 2 }}
        >
          {options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const { children, asChild, ...htmlProps } = rest as LabelStaticProps;
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      className={cn(
        "inline-flex items-center rounded-[8px] bg-control-secondary px-3 py-1.5 text-sm font-semibold text-text-secondary-control",
        disabled && "opacity-60 pointer-events-none",
        className,
      )}
      style={style}
      {...htmlProps}
    >
      {children}
    </Comp>
  );
};
