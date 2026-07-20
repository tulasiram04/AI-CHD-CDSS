"use client";

import React, { useRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function GlassButton({
  variant = "primary",
  size = "md",
  children,
  className = "",
  onClick,
  ...props
}: GlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-primary text-white hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.2)]";
      case "success":
        return "bg-success text-white hover:bg-emerald-600 shadow-[0_4px_14px_0_rgba(34,197,94,0.2)]";
      case "danger":
        return "bg-danger text-white hover:bg-rose-600 shadow-[0_4px_14px_0_rgba(239,68,68,0.2)]";
      case "warning":
        return "bg-warning text-white hover:bg-amber-600 shadow-[0_4px_14px_0_rgba(245,158,11,0.2)]";
      case "secondary":
      default:
        return "bg-white/60 hover:bg-white/80 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-xs font-semibold rounded-lg";
      case "lg":
        return "px-6 py-3 text-base font-bold rounded-xl";
      case "md":
default:
        return "px-4 py-2 text-sm font-bold rounded-xl";
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.disabled) return;

    if (buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height) * 2}px`;

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    }

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      ref={buttonRef}
      whileHover={props.disabled ? undefined : { y: -1, scale: 1.01 }}
      whileTap={props.disabled ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      onClick={handleClick}
      className={`ripple-effect cursor-pointer inline-flex items-center justify-center gap-2 transition-all duration-200 outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:pointer-events-none ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
