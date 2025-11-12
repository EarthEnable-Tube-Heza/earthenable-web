/**
 * useScrollbarCompensation
 *
 * Prevents layout shift when modals/dropdowns lock body scroll by
 * calculating scrollbar width and applying padding compensation.
 */

import { useEffect } from "react";

export function useScrollbarCompensation() {
  useEffect(() => {
    // Calculate scrollbar width
    const getScrollbarWidth = (): number => {
      const outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.overflow = "scroll";
      document.body.appendChild(outer);

      const inner = document.createElement("div");
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      outer.remove();

      return scrollbarWidth;
    };

    const scrollbarWidth = getScrollbarWidth();

    // Create MutationObserver to watch for overflow changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          const target = mutation.target as HTMLElement;
          const hasOverflowHidden = target.style.overflow === "hidden";

          if (hasOverflowHidden && scrollbarWidth > 0) {
            // Add padding to compensate for missing scrollbar
            document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
          } else {
            // Remove padding when overflow is restored
            document.documentElement.style.paddingRight = "";
          }
        }
      });
    });

    // Observe body element for style changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      observer.disconnect();
      document.documentElement.style.paddingRight = "";
    };
  }, []);
}
