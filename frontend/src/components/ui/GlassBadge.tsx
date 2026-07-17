"use client";

import React from "react";

interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
  children: React.ReactNode;
}

export default function GlassBadge({
  variant = "primary",
  children,
  className = "",
  ...props
}: GlassBadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-500/10 text-blue-600 border-blue-200/40";
      case "success":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200/40";
      case "warning":
        return "bg-amber-500/10 text-amber-600 border-amber-200/40";
      case "danger":
        return "bg-rose-500/10 text-rose-600 border-rose-200/40";
      case "neutral":
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200/40";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getVariantStyles()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
