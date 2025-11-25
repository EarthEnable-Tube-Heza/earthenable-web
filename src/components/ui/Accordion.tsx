"use client";

/**
 * Accordion Component
 *
 * Collapsible content panels for FAQs, settings, and other grouped content.
 * Follows EarthEnable design system with smooth animations.
 */

import { useState, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/theme";

// Accordion Item Props
export interface AccordionItemProps {
  /**
   * Unique identifier for the accordion item
   */
  id: string;

  /**
   * Title/trigger content displayed in the header
   */
  title: string;

  /**
   * Content displayed when accordion is expanded
   */
  content: ReactNode;

  /**
   * Whether the item is initially open
   */
  defaultOpen?: boolean;
}

// Accordion Props
export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Array of accordion items
   */
  items: AccordionItemProps[];

  /**
   * Whether multiple items can be open at once
   */
  allowMultiple?: boolean;

  /**
   * Visual variant
   */
  variant?: "default" | "bordered" | "separated";
}

/**
 * Individual Accordion Item Component
 */
function AccordionItem({
  item,
  isOpen,
  onToggle,
  variant = "default",
}: {
  item: AccordionItemProps;
  isOpen: boolean;
  onToggle: () => void;
  variant?: "default" | "bordered" | "separated";
}) {
  const variantStyles = {
    default: "border-b border-border-light last:border-b-0",
    bordered: "border border-border-light rounded-lg mb-2",
    separated: "border border-border-light rounded-lg mb-4 shadow-sm",
  };

  return (
    <div className={cn(variantStyles[variant], "overflow-hidden")}>
      {/* Header/Trigger */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between",
          "px-4 sm:px-6 py-3 sm:py-4",
          "text-left transition-colors duration-150",
          "hover:bg-background-light",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
          isOpen && "bg-background-light"
        )}
        aria-expanded={isOpen}
      >
        <span className="font-heading font-medium text-sm sm:text-base text-text-primary pr-4">
          {item.title}
        </span>

        {/* Chevron Icon */}
        <svg
          className={cn(
            "flex-shrink-0 w-5 h-5 text-text-secondary transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content Panel */}
      <div
        className={cn(
          "transition-all duration-200 ease-in-out overflow-hidden",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-text-secondary leading-relaxed border-t border-border-light">
          {item.content}
        </div>
      </div>
    </div>
  );
}

/**
 * Accordion Component
 */
export function Accordion({
  items,
  allowMultiple = false,
  variant = "default",
  className,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter((item) => item.defaultOpen).map((item) => item.id))
  );

  const handleToggle = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(id)) {
        // Close the item
        newSet.delete(id);
      } else {
        // Open the item
        if (allowMultiple) {
          newSet.add(id);
        } else {
          // Close all others and open this one
          newSet.clear();
          newSet.add(id);
        }
      }

      return newSet;
    });
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => handleToggle(item.id)}
          variant={variant}
        />
      ))}
    </div>
  );
}
