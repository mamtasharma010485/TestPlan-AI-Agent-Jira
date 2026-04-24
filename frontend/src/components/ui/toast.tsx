import * as React from "react";
import { cn } from "../../lib/utils";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Toast({ title, description, variant = "default", open, onOpenChange }: ToastProps) {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  const variantStyles = {
    default: "bg-gray-900 text-white",
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-white",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn("rounded-md p-4 shadow-lg", variantStyles[variant])}>
        {title && <p className="font-semibold">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    title?: string;
    description?: string;
    variant?: "default" | "success" | "error" | "warning";
  }>>([]);

  const toast = React.useCallback((props: {
    title?: string;
    description?: string;
    variant?: "default" | "success" | "error" | "warning";
  }) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, ...props }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toast, dismiss, toasts };
}
