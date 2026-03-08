import { useRef, useEffect } from "react";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

interface WheelPickerProps {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  formatItem: (v: number) => string;
}

const WheelPicker = ({ items, value, onChange, formatItem }: WheelPickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (containerRef.current && !isScrollingRef.current) {
      const idx = items.indexOf(value);
      containerRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
  }, [value, items]);

  const handleScroll = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isScrollingRef.current = true;
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const idx = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(idx, items.length - 1));
        containerRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
        onChange(items[clamped]);
      }
      isScrollingRef.current = false;
    }, 80);
  };

  return (
    <div className="relative flex-1" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
      <div
        className="pointer-events-none absolute left-0 right-0 z-10 rounded-xl bg-sage-100"
        style={{ top: ITEM_HEIGHT * 2, height: ITEM_HEIGHT }}
      />
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-20 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-20 bg-gradient-to-t from-card to-transparent" />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-none"
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: ITEM_HEIGHT * 2,
          paddingBottom: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-center text-lg font-semibold text-foreground"
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: "start" }}
          >
            {formatItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WheelPicker;
