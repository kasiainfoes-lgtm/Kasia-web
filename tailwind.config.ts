import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vivi: {
          navy: '#0B1524',
          navyLight: '#152238',
          mint: '#22D3AA',
          mintLight: '#D6F7EA',
          coral: '#FB7360',
          purple: '#8B7CF6',
          blue: '#5B93F2',
          bg: '#F4F6F9',
          ink: '#0F172A',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
