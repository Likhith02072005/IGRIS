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
        background: '#0a0a0a',
        foreground: '#fafafa',
        surface: '#111111',
        border: '#1a1a1a',
        muted: '#666666',
        accent: {
          light: '#67e8f9',
          DEFAULT: '#22d3ee',
          dark: '#0891b2'
        },
        profit: '#22c55e',
        loss: '#ef4444',
      },
    },
  },
  plugins: [],
};
export default config;
