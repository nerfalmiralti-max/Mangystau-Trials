"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ToastKind = "success" | "error" | "info";

type ToastInput = {
  title: string;
  message?: string;
  kind?: ToastKind;
  duration?: number;
};

type ToastRecord = Required<Pick<ToastInput, "title" | "kind" | "duration">> & {
  id: number;
  message?: string;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => number;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
let nextToastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const id = ++nextToastId;
    const toast: ToastRecord = {
      id,
      title: input.title,
      message: input.message,
      kind: input.kind ?? "info",
      duration: input.duration ?? 4200,
    };

    setToasts((current) => [...current.filter((item) => item.title !== toast.title), toast].slice(-3));
    return id;
  }, []);

  const context = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={context}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[1200] flex flex-col items-end gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-[min(24rem,calc(100vw-3rem))]"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.duration, toast.id]);

  const isError = toast.kind === "error";
  const isSuccess = toast.kind === "success";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`pointer-events-auto grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
        isError
          ? "border-amber-300/35 bg-[#211a0f]/95"
          : isSuccess
            ? "border-emerald-300/30 bg-[#0c1d19]/95"
            : "border-white/16 bg-[#111]/95"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 grid size-6 place-items-center rounded-full text-sm font-bold ${
          isError
            ? "bg-amber-300/16 text-amber-100"
            : isSuccess
              ? "bg-emerald-300/14 text-emerald-100"
              : "bg-white/10 text-white/80"
        }`}
      >
        {isError ? "!" : isSuccess ? "✓" : "i"}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{toast.title}</span>
        {toast.message ? (
          <span className="mt-1 block text-xs leading-5 text-white/64">{toast.message}</span>
        ) : null}
      </span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="-mr-2 -mt-2 grid min-h-11 min-w-11 place-items-center rounded-full text-xl text-white/55 transition-colors duration-150 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9b382]"
        aria-label={`Dismiss ${toast.title} notification`}
      >
        ×
      </button>
    </motion.div>
  );
}
