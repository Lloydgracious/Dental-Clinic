"use client";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md font-semibold tracking-[0.01em] transition-colors focus:outline-none focus:ring-4 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-accent-primary text-white hover:bg-accent-strong focus:ring-accent-primary/25 shadow-[var(--shadow-soft)]",
      secondary: "bg-surface-strong text-foreground hover:bg-border focus:ring-border/40",
      outline: "border border-border bg-surface-light text-foreground hover:bg-surface-muted focus:ring-border/30",
      ghost: "text-muted hover:text-foreground hover:bg-surface-muted focus:ring-border/30",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-sm",
      md: "h-10 px-4.5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyle, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
