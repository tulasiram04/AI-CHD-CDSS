"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
  children: React.ReactNode;
}

export default function GlassCard({
  hoverLift = false,
  children,
  className = "",
  ...props
}: GlassCardProps) {
  const cardContent = (
    <div
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${
        hoverLift ? "hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.08)] hover:bg-white/80" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );

  if (hoverLift) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
