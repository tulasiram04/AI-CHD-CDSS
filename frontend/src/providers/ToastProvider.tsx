"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  toast: (message: any, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function formatErrorMessage(detail: any): string {
  if (detail === null || detail === undefined) {
    return "";
  }
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === "object") {
          const field = item.loc && Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "";
          const msg = item.msg || JSON.stringify(item);
          return field ? `${field}: ${msg}` : msg;
        }
        return String(item);
      })
      .join(", ");
  }
  if (typeof detail === "object") {
    if (detail.message) return String(detail.message);
    if (detail.detail) return formatErrorMessage(detail.detail);
    return JSON.stringify(detail);
  }
  return String(detail);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: any, type: ToastType = "info", title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const formattedMessage = formatErrorMessage(message);
    setToasts((prev) => [...prev, { id, message: formattedMessage, type, title }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case "error":
        return <XCircle className="h-5 w-5 text-rose-500 shrink-0" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/20 bg-emerald-50/70";
      case "warning":
        return "border-amber-500/20 bg-amber-50/70";
      case "error":
        return "border-rose-500/20 bg-rose-50/70";
      case "info":
        return "border-blue-500/20 bg-blue-50/70";
    }
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-xl border glass-panel shadow-[0_12px_40px_0_rgba(31,38,135,0.08)] pointer-events-auto flex gap-3 items-start ${getBorderColor(
                t.type
              )}`}
            >
              {getIcon(t.type)}
              <div className="flex-1 space-y-0.5">
                {t.title && (
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
