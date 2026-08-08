"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function BottomSheet({ open, onClose, title, kicker, children, footer }: BottomSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !sheetRef.current) return;
      const focusable = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("sheet-is-open");
    const focusTimer = window.setTimeout(() => {
      const firstField = sheetRef.current?.querySelector<HTMLElement>("input:not([disabled]), textarea:not([disabled]), select:not([disabled])");
      (firstField ?? closeRef.current)?.focus();
    }, 20);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("sheet-is-open");
      window.clearTimeout(focusTimer);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={sheetRef} className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="sheet-grabber" aria-hidden="true" />
        <header className="sheet-header">
          <div>
            {kicker ? <p className="eyebrow">{kicker}</p> : null}
            <h2 id="sheet-title">{title}</h2>
          </div>
          <button ref={closeRef} className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="sheet-content">{children}</div>
        {footer ? <footer className="sheet-footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
