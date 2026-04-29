import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        muted: "var(--muted)",
        accent: {
          primary: "var(--primary)",
          strong: "var(--primary-strong)",
          charcoal: "#1F2937",
          orange: "var(--primary)",
        },
        surface: {
          light: "var(--surface)",
          muted: "var(--surface-alt)",
          strong: "var(--surface-strong)",
          dark: "var(--surface)",
          card: "var(--surface)",
        }
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(0,0,0,0.05)",
        layer: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        glow: "0 0 20px rgba(255, 90, 31, 0.3)",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "50%": { transform: "translateX(5px)" },
          "75%": { transform: "translateX(-5px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        shimmer: "shimmer 2s infinite",
      }
    },
  },
  plugins: [],
};
export default config;
