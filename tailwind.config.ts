import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        cream: "#FFF9F0",
        bark: "#2C1810",
        moss: {
          50: "#F0F7F0",
          100: "#D4ECD4",
          200: "#A8D9A8",
          400: "#5CB85C",
          500: "#3D8B3D",
          600: "#2D6B2D",
          700: "#1E4D1E",
        },
        coral: {
          50: "#FFF0ED",
          100: "#FFD6CC",
          300: "#FF8A70",
          400: "#FF6B4A",
          500: "#E5533A",
        },
        sand: {
          50: "#FEFCF8",
          100: "#FAF5EB",
          200: "#F0E6D3",
          300: "#E0D0B8",
          400: "#C4AD8D",
        },
        night: {
          800: "#1A1A2E",
          900: "#0F0F1A",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 20px rgba(44, 24, 16, 0.06)",
        card: "0 4px 30px rgba(44, 24, 16, 0.08)",
        glow: "0 0 40px rgba(93, 184, 92, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
