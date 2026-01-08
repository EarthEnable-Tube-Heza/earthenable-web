"use client";

/**
 * Tooltip Component
 *
 * A simple tooltip that appears on hover.
 */

import { useState, ReactNode } from "react";
import { cn } from "@/src/lib/theme";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (disabled || !content) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent",
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            positionClasses[position]
          )}
          role="tooltip"
        >
          {content}
          <div className={cn("absolute w-0 h-0 border-4", arrowClasses[position])} />
        </div>
      )}
    </div>
  );
}
