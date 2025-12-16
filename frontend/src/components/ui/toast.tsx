"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  show: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "info", title?: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[1700]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[280px] max-w-[360px] rounded-md border p-3 shadow-lg bg-white ${
              t.type === "success"
                ? "border-green-200"
                : t.type === "error"
                ? "border-red-200"
                : "border-gray-200"
            }`}
          >
            {t.title && <div className="font-medium mb-1">{t.title}</div>}
            <div className="text-sm text-gray-700">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
