"use client";

import { useEffect, useRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";

export function Button({ children, className = "", variant = "secondary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button {...props} className={`ui-button ui-button--${variant} ${className}`}>{children}</button>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function Card({ children, className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section {...props} className={`surface rounded-xl border ${className}`}>{children}</section>;
}

export function StatePanel({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return <Card className="state-panel p-6"><span aria-hidden="true" className="state-panel__rail" /><h2 className="text-primary font-semibold">{title}</h2><p className="text-secondary mt-2 text-sm">{message}</p>{action ? <div className="mt-4">{action}</div> : null}</Card>;
}

export function Dialog({ children, className = "", label, onClose }: { children: React.ReactNode; className?: string; label: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') || []);
    const focusFirst = window.setTimeout(() => focusable()[0]?.focus(), 0);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); onCloseRef.current(); return; }
      if (event.key !== "Tab") return;
      const items = focusable(); const first = items[0]; const last = items.at(-1);
      if (!first || !last) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("dialog-open");
    return () => { window.clearTimeout(focusFirst); document.removeEventListener("keydown", onKeyDown); document.body.classList.remove("dialog-open"); returnFocusRef.current?.focus(); };
  }, []);

  return <div className="dialog-backdrop fixed inset-0 z-40 overflow-y-auto p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onCloseRef.current(); }} role="presentation"><div aria-label={label} aria-modal="true" className={`surface dialog-panel mx-auto w-full border shadow-2xl ${className}`} ref={dialogRef} role="dialog" tabIndex={-1}>{children}</div></div>;
}
