import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta minimalista cálida (gris piedra + negro), estilo
        // portfolio: fondo gris cálido, tarjetas color crema, texto
        // casi negro, acento oscuro en vez de colores vivos.
        vivi: {
          navy: '#15140F',
          navyLight: '#2B2A24',
          mint: '#3A382F',
          mintLight: '#EDEAE2',
          coral: '#EDEAE2',
          purple: '#8B7CF6',
          blue: '#5B93F2',
          bg: '#DBD8D1',
          card: '#F1EEE7',
          ink: '#19180F',
          muted: '#726F65',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
        xl: '1rem',
        '2xl': '1.75rem',
        '3xl': '2.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
