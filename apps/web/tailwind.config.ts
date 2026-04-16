import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Warm gray palette — less cold than zinc, easier on the eyes
        surface: {
          DEFAULT: '#f8f9fb',
          raised: '#ffffff',
          sunken: '#f1f2f6',
          border: '#e8e9f0',
          'border-hover': '#d4d5e0',
        },
        content: {
          DEFAULT: '#1a1a2e',     // primary text
          secondary: '#4a4a5a',    // body text
          tertiary: '#8b8fa3',     // labels, captions
          muted: '#a0a3b5',        // placeholder, disabled
          inverse: '#ffffff',
        },
        // Brand — indigo-leaning blue, more premium than pure blue
        brand: {
          DEFAULT: '#4f46e5',
          light: '#6366f1',
          lighter: '#eef2ff',
          dark: '#3730a3',
        },
        // Sidebar — soft dark, not pitch black
        sidebar: {
          bg: '#1e1e2d',
          hover: '#2a2a3d',
          active: '#33334d',
          border: '#2a2a3d',
          text: '#9ca0b8',
          'text-active': '#ffffff',
        },
        // Semantic colors
        success: { DEFAULT: '#059669', light: '#ecfdf5' },
        warning: { DEFAULT: '#d97706', light: '#fffbeb' },
        danger:  { DEFAULT: '#dc2626', light: '#fef2f2' },
        info:    { DEFAULT: '#2563eb', light: '#eff6ff' },
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        lg: '14px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'elevated': '0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
