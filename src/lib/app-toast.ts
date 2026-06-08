import { createElement, type ReactNode } from "react";
import { toast } from "@/components/ui/sonner";
import AppToastStatusIcon from "@/components/ui/AppToastStatusIcon";

type AppToastOptions = {
  duration?: number;
  description?: string;
  icon?: ReactNode;
};

const normalizeMessage = (message: string) => message.trim().replace(/[.\s]+$/, "");

const normalizeOptions = (options?: AppToastOptions): AppToastOptions | undefined => {
  if (!options) return options;

  return {
    ...options,
    description: typeof options.description === "string" ? normalizeMessage(options.description) : options.description,
  };
};

export const appToast = {
  success(message: string, options?: AppToastOptions) {
    toast.dismiss();
    return toast.success(normalizeMessage(message), {
      icon: createElement(AppToastStatusIcon, { variant: "success" }),
      ...normalizeOptions(options),
    });
  },
  error(message: string, options?: AppToastOptions) {
    toast.dismiss();
    return toast.error(normalizeMessage(message), {
      icon: createElement(AppToastStatusIcon, { variant: "error" }),
      ...normalizeOptions(options),
    });
  },
  info(message: string, options?: AppToastOptions) {
    toast.dismiss();
    return toast(normalizeMessage(message), {
      icon: createElement(AppToastStatusIcon, { variant: "info" }),
      ...normalizeOptions(options),
    });
  },
};
