import type { CSSProperties } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const toastSurfaceStyle = {
    background: "var(--control-secondary)",
    color: "var(--text-main)",
    borderColor: "var(--icon-secondary)",
    opacity: 1,
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
    "--normal-bg": "var(--control-secondary)",
    "--normal-text": "var(--text-main)",
    "--normal-border": "var(--icon-secondary)",
  } as CSSProperties & Record<string, string | number>;

  return (
    <Sonner
      position="top-center"
      theme="light"
      className="toaster group"
      style={{ zIndex: 9999 }}
      toastOptions={{
        style: toastSurfaceStyle,
        classNames: {
          toast:
            "group toast !mx-auto !self-center !w-fit !min-w-0 !max-w-[min(400px,calc(100vw-3rem))] !items-center gap-2 !rounded-2xl px-4 py-3 !text-[14px] font-semibold !bg-control-secondary !text-text-main !border-icon-secondary !opacity-100 !backdrop-blur-none shadow-[0_12px_30px_rgba(0,0,0,0.18)] [&_svg]:h-5 [&_svg]:w-5",
          description: "text-[14px] group-[.toast]:text-muted-foreground truncate whitespace-nowrap overflow-hidden max-w-full",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          title: "text-[14px] font-semibold truncate whitespace-nowrap overflow-hidden max-w-full",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
