import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminModalProps = {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: AdminModalProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Prevent background scroll while open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    // Focus first focusable element inside the modal for accessibility
    const t = window.setTimeout(() => {
      const root = panelRef.current;
      if (!root) return;
      const firstFocusable = root.querySelector<HTMLElement>(
        "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
      );
      firstFocusable?.focus();
    }, 0);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      <div
        className="absolute inset-0 bg-black/80"
        onMouseDown={(e) => {
          // Block interactions to the page below; do not close on backdrop click
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl",
            className,
          )}
          onMouseDown={(e) => {
            // Avoid backdrop handlers or drag contexts affecting the modal
            e.stopPropagation();
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h2>
              {description ? (
                <div className="mt-2 text-sm text-muted-foreground">
                  {description}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Tutup</span>
            </button>
          </div>

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
