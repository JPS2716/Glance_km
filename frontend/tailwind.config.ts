import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "surface-bright": "#2b2c2c",
        "surface-container-low": "#131313",
        "surface-container-lowest": "#000000",
        "on-surface-variant": "#acabaa",
        surface: "#0e0e0e",
        "surface-variant": "#252626",
        "on-surface": "#e7e5e5",
        primary: "#a2c9ff",
        "primary-dim": "#88bcff",
        "primary-container": "#004882",
        "on-primary": "#004176",
        background: "#0e0e0e",
        "outline-variant": "#484848",
        "surface-container": "#191a1a",
        "surface-container-high": "#1f2020",
        "surface-container-highest": "#252626",
      },
      fontFamily: {
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
