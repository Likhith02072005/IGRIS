import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030712", // deep dark slate/black
        foreground: "#f3f4f6",
        card: "rgba(17, 24, 39, 0.65)", // semi-transparent gray
        border: "rgba(55, 65, 81, 0.4)",
        brand: {
          light: "#60a5fa",
          DEFAULT: "#3b82f6", // Neon blue highlight
          dark: "#1d4ed8",
        },
        bloomberg: {
          green: "#00ff66", // Bloomberg green PnL
          red: "#ff3333",   // Bloomberg red PnL
          yellow: "#ffcc00",
          blue: "#00d2ff",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-inset": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
