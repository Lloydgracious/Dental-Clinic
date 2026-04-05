"use client";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

export interface CardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -4, scale: 1.01 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "bg-white dark:bg-surface-dark/40 dark:backdrop-blur-md rounded-3xl p-6 shadow-layer border border-gray-50/50 dark:border-gray-800 relative overflow-hidden transition-colors duration-300",
          hoverEffect && "hover:shadow-soft dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
