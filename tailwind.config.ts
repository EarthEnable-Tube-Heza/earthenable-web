import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // EarthEnable brand colors (matching React Native app)
        primary: "#EA6A00", // Orange
        secondary: "#78373B", // Dark red/brown
        accent: "#D5A34C", // Gold
        background: {
          primary: "#F7EDDB", // Cream
          white: "#FFFFFF",
          light: "#FDFCFC",
          card: "#FFFFFF",
        },
        status: {
          error: "#E04562",
          success: "#124D37",
          warning: "#D5A34C",
          info: "#3E57AB",
          overdue: "#d32f2f",
        },
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
          disabled: "#9CA3AF",
        },
      },
      fontFamily: {
        heading: ["Ropa Sans", "sans-serif"],
        body: ["Lato", "sans-serif"],
        flourish: ["Literata", "serif"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        full: "9999px",
      },
      boxShadow: {
        small: "0 1px 2px 0 rgba(0, 0, 0, 0.1)",
        medium: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
        large: "0 4px 8px 0 rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
