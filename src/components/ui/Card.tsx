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
        whileHover={hoverEffect ? { y: -2 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "bg-surface-light rounded-xl p-6 shadow-[var(--shadow-crisp)] border border-border relative overflow-hidden transition-colors duration-300",
          hoverEffect && "hover:border-accent-primary/35 transition-all duration-300",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
