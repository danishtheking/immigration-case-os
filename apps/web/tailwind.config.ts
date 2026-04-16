import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b1320',
        brand: {
          DEFAULT: '#1d4ed8',
          light: '#0ea5e9',
        },
      },
    },
  },
  plugins: [],
};

export default config;
