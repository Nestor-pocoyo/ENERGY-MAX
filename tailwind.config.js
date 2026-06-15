/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        navy: '#0d1b34',
        electric: '#2378ff',
        violet: '#7c3cff',
        teal: '#22cfc2',
        leaf: '#127a53',
        mist: '#eef6ff',
      },
      boxShadow: {
        soft: '0 24px 70px rgba(7, 17, 31, 0.16)',
        glow: '0 30px 90px rgba(35, 120, 255, 0.28)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
