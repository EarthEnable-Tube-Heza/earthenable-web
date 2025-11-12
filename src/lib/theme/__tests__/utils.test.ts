import {
  getColor,
  getSpacing,
  getShadow,
  getBorderRadius,
  getStatusColorClass,
  getStatusBgClass,
  getTransitionDuration,
  isBreakpoint,
  getResponsiveClasses,
  cn,
  getZIndex,
  getCSSVar,
  theme,
} from "../utils";

describe("Theme Utilities", () => {
  describe("getColor", () => {
    it("returns color for valid path", () => {
      expect(getColor("primary")).toBe("#EA6A00");
    });

    it("returns nested color value", () => {
      expect(getColor("background.primary")).toBe("#F7EDDB");
    });

    it("returns fallback for invalid path", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const result = getColor("invalid.path");
      expect(result).toBe("#000000");
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("not found"));
      consoleSpy.mockRestore();
    });

    it("returns fallback when trying to access nested property on a string value", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      // Try to access a nested path on a leaf value (string)
      const result = getColor("primary.invalid");
      expect(result).toBe("#000000");
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("is invalid"));
      consoleSpy.mockRestore();
    });
  });

  describe("getSpacing", () => {
    it("returns spacing value", () => {
      expect(getSpacing("md")).toBe("1rem");
    });
  });

  describe("getShadow", () => {
    it("returns shadow value", () => {
      const shadow = getShadow("medium");
      expect(shadow).toContain("rgba");
    });
  });

  describe("getBorderRadius", () => {
    it("returns border radius value", () => {
      expect(getBorderRadius("md")).toBe("0.5rem");
    });
  });

  describe("getStatusColorClass", () => {
    it("returns correct CSS class for status", () => {
      expect(getStatusColorClass("error")).toBe("text-status-error");
      expect(getStatusColorClass("success")).toBe("text-status-success");
      expect(getStatusColorClass("warning")).toBe("text-status-warning");
      expect(getStatusColorClass("info")).toBe("text-status-info");
    });
  });

  describe("getStatusBgClass", () => {
    it("returns correct CSS background class for status", () => {
      expect(getStatusBgClass("error")).toBe("bg-status-error");
      expect(getStatusBgClass("success")).toBe("bg-status-success");
      expect(getStatusBgClass("warning")).toBe("bg-status-warning");
      expect(getStatusBgClass("info")).toBe("bg-status-info");
    });
  });

  describe("getTransitionDuration", () => {
    it("returns transition duration in milliseconds", () => {
      expect(getTransitionDuration("fast")).toBe("150ms");
      expect(getTransitionDuration("normal")).toBe("300ms");
      expect(getTransitionDuration("slow")).toBe("500ms");
    });
  });

  describe("isBreakpoint", () => {
    it("checks window width against breakpoint", () => {
      // Mock window.innerWidth
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      expect(isBreakpoint("md")).toBe(false);

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });
      expect(isBreakpoint("md")).toBe(true);
    });

    it("returns false on server-side (when window is undefined)", () => {
      // Save original window
      const originalWindow = global.window;

      // Delete window to simulate server-side
      // @ts-expect-error - intentionally deleting window for test
      delete global.window;

      expect(isBreakpoint("md")).toBe(false);

      // Restore window
      global.window = originalWindow;
    });
  });

  describe("getResponsiveClasses", () => {
    it("returns base class only", () => {
      expect(getResponsiveClasses({ base: "text-sm" })).toBe("text-sm");
    });

    it("returns base and breakpoint classes", () => {
      const result = getResponsiveClasses({
        base: "text-sm",
        md: "text-base",
        lg: "text-lg",
      });
      expect(result).toContain("text-sm");
      expect(result).toContain("md:text-base");
      expect(result).toContain("lg:text-lg");
    });

    it("handles undefined breakpoint values", () => {
      const result = getResponsiveClasses({
        base: "text-sm",
        md: undefined,
      });
      expect(result).toBe("text-sm");
    });
  });

  describe("cn", () => {
    it("combines multiple class names", () => {
      expect(cn("text-primary", "font-bold")).toBe("text-primary font-bold");
    });

    it("filters out falsy values", () => {
      expect(cn("text-primary", false, "font-bold", null, undefined)).toBe(
        "text-primary font-bold"
      );
    });

    it("handles conditional classes", () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn("btn", isActive && "active", isDisabled && "disabled")).toBe("btn active");
    });

    it("returns empty string when all values are falsy", () => {
      expect(cn(false, null, undefined)).toBe("");
    });
  });

  describe("getZIndex", () => {
    it("returns z-index value", () => {
      expect(getZIndex("modal")).toBe(1400);
    });
  });

  describe("getCSSVar", () => {
    it("returns CSS custom property name", () => {
      expect(getCSSVar("primary")).toBe("--color-primary");
    });

    it("uses custom prefix", () => {
      expect(getCSSVar("large", "spacing")).toBe("--spacing-large");
    });
  });

  describe("theme export", () => {
    it("exports theme constant", () => {
      expect(theme).toBeDefined();
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.breakpoints).toBeDefined();
    });
  });

  describe("getResponsiveClasses edge cases", () => {
    it("handles no base class", () => {
      const result = getResponsiveClasses({
        md: "text-base",
        lg: "text-lg",
      });
      expect(result).toContain("md:text-base");
      expect(result).toContain("lg:text-lg");
      expect(result).not.toContain("undefined");
    });
  });
});
