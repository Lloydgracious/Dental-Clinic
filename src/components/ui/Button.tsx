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
    const baseStyle = "inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus:outline-none focus:ring-4 relative overflow-hidden";
    
    const variants = {
      primary: "bg-accent-primary text-white hover:bg-[#2B4CB3] focus:ring-accent-primary/20 shadow-lg",
      secondary: "bg-surface-muted text-accent-charcoal hover:bg-gray-100 focus:ring-gray-200",
      outline: "border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 focus:ring-gray-100",
      ghost: "text-gray-600 hover:text-accent-charcoal hover:bg-gray-100 focus:ring-gray-100",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
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
