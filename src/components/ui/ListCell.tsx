import React from "react";
import { ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
// ...existing code...
import { ButtonLow } from "@/components/ui/ButtonLow";
import { Label } from "@/components/ui/label";
import type { LabelOption } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Navigation arrow — no extra data needed. */
type ChevronSlot = { type: "chevron" };

/** Read-only text value displayed on the right. */
type TextSlot = { type: "text"; value: string };

/** Text value with a trailing chevron. */
type ChevronTextSlot = { type: "chevron-text"; value: string };

/** Inline editable text input. */
type InputSlot = {
  type: "input";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
};

/** Label pill with native action-menu select. */
type SelectSlot = {
  type: "select";
  options: LabelOption[];
  value: string | number;
  displayValue: string;
  onChange: (value: string | number) => void;
};

/** Label pill as a tappable action. */
type LabelSlot = { type: "label"; label: string; onPress?: () => void };

/** ButtonLow as a right-side action. */
type ButtonLowSlot = {
  type: "button-low";
  label: string;
  variant?: "primary" | "secondary";
  onPress?: () => void;
};

/** Dimmed read-only text. */
type DisabledTextSlot = { type: "disabled-text"; value: string };

/** Toggle switch. */
type SwitchSlot = { type: "switch"; checked: boolean; onCheckedChange: (checked: boolean) => void };

// ...existing code...

type RightSlot =
  | ChevronSlot
  | TextSlot
  | ChevronTextSlot
  | InputSlot
  | SelectSlot
  | LabelSlot
  | ButtonLowSlot
  | DisabledTextSlot
  | SwitchSlot;

const RightSlotRenderer = ({ slot }: { slot: RightSlot }) => {
  switch (slot.type) {
    case "chevron":
      return <ChevronRight className="h-4 w-4 text-muted-foreground" />;
    case "text":
      return <span className="text-sm text-muted-foreground">{slot.value}</span>;
    case "chevron-text":
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">{slot.value}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      );
    case "input":
      return (
        <input
          value={slot.value}
          onChange={(e) => slot.onChange(e.target.value)}
          placeholder={slot.placeholder}
          className={cn(
            "w-32 bg-transparent text-right text-sm text-foreground placeholder:text-muted-foreground placeholder:opacity-50 focus:outline-none",
            slot.inputClassName,
          )}
        />
      );
    case "select":
      return (
        <Label
          mode="select"
          options={slot.options}
          value={slot.value}
          displayValue={slot.displayValue}
          onChange={slot.onChange}
        />
      );
    case "label":
      return <Label onClick={slot.onPress}>{slot.label}</Label>;
    case "button-low":
      return (
        <ButtonLow variant={slot.variant ?? "primary"} onClick={slot.onPress}>
          {slot.label}
        </ButtonLow>
      );
    case "disabled-text":
      return <span className="text-sm text-muted-foreground opacity-50">{slot.value}</span>;
    case "switch":
      return <Switch checked={slot.checked} onCheckedChange={slot.onCheckedChange} />;
    // ...existing code...
  }
};

export interface ListCellProps {
  /** Optional left icon (fixed 20x20). */
  icon?: React.ReactNode;
  /** Main title text (max 2 lines). */
  title: React.ReactNode;
  /** Optional subtitle text (max 5 lines). */
  subtitle?: React.ReactNode;
  /** Row press handler, enabled only for chevron-style right slots. */
  onPress?: () => void;
  /** Typed right-slot content. */
  right?: RightSlot;
  /** Additional class name for right slot wrapper. */
  rightContainerClassName?: string;
  /** Additional class name on the root element. */
  className?: string;
}

export const ListCell = (props: ListCellProps) => {
  const { icon, title, subtitle, onPress, right, rightContainerClassName, className } = props;
  const isChevronRow = right?.type === "chevron" || right?.type === "chevron-text";
  const isRowPressEnabled = isChevronRow;

  const rootClasses = [
    "flex w-full items-center justify-between rounded-[28px] bg-secondary px-6 py-4", // px-6 = 24px
    "min-h-[78px]",
    "gap-2", // gap-2 = 8px
    "transition-all",
    isRowPressEnabled ? "cursor-pointer" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClasses} onClick={isChevronRow ? onPress : undefined}>
      <div className="flex min-w-0 items-center gap-2">
        {icon ? (
          <div className="flex h-4 w-4 items-center justify-center text-icon-primary [&_svg]:text-icon-primary">
            {React.isValidElement(icon)
              ? React.cloneElement(icon, {
                  style: { height: 16, width: 16 },
                  className: cn(icon.props.className, "h-4 w-4"),
                })
              : icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="text-base font-medium text-foreground line-clamp-2">
            {title}
          </div>
          {subtitle ? (
            <div className="text-xs text-muted-foreground line-clamp-5">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>

      {right ? (
        <div className={`flex items-center gap-2 ${rightContainerClassName ?? ""}`}>
          <RightSlotRenderer slot={right} />
        </div>
      ) : null}
    </div>
  );
};
