import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['DM Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        background: '#f0f2f5',
        foreground: '#1a1a2e',
        surface: 'rgba(255, 255, 255, 0.65)',
        'surface-solid': '#ffffff',
        border: 'rgba(255, 255, 255, 0.45)',
        muted: '#64748b',
        accent: {
          light: '#a78bfa',
          DEFAULT: '#7c3aed',
          dark: '#5b21b6',
        },
        profit: '#10b981',
        loss: '#ef4444',
        data: '#0ea5e9',
      },
      borderRadius: {
        glass: '20px',
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.06)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.1)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        soft: '0 2px 12px rgba(0, 0, 0, 0.04)',
        card: '0 4px 24px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;
