"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useState } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-gray-600 ml-1">
            {label}
          </label>
        )}
        <motion.div
          animate={error ? "shake" : "none"}
          variants={{
            shake: { x: [0, -5, 5, -5, 5, 0], transition: { duration: 0.4 } },
            none: { x: 0 }
          }}
          className="relative"
        >
          <input
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "w-full bg-white border-2 rounded-2xl px-4 py-3 text-base text-accent-charcoal outline-none transition-all placeholder:text-gray-400 focus:ring-4",
              error 
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" 
                : "border-gray-100 focus:border-accent-primary focus:ring-accent-primary/10 hover:border-gray-200",
              className
            )}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
