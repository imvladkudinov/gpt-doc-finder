import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface TagOption<Value extends string | number = string | number> {
  value: Value;
  label: string;
}

interface TagStaticProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  disabled?: boolean;
  asChild?: boolean;
  options?: never;
  value?: never;
  displayValue?: never;
  onChange?: never;
}

interface TagSelectorProps {
  children?: never;
  disabled?: boolean;
  asChild?: never;
  className?: string;
  style?: React.CSSProperties;
  /** List of options — providing this activates selector mode. */
  options: TagOption[];
  value: string | number;
  displayValue: string;
  onChange: (value: string | number) => void;
}

export type TagProps = TagStaticProps | TagSelectorProps;

export const Tag = ({ className, disabled, ...rest }: TagProps) => {
  if ("options" in rest && rest.options !== undefined) {
    const { options, value, displayValue, onChange, style } = rest as TagSelectorProps;
    return (
      <div className={className} style={{ position: "relative", display: "inline-block", ...style }}>
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-control-secondary px-3 py-1.5 text-sm font-semibold text-primary cursor-pointer",
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

  const { children, asChild, ...htmlProps } = rest as TagStaticProps;
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      className={cn(
        "inline-flex items-center rounded-full bg-control-secondary px-3 py-1.5 text-sm font-semibold text-primary",
        disabled && "opacity-60 pointer-events-none",
        className,
      )}
      {...htmlProps}
    >
      {children}
    </Comp>
  );
};
