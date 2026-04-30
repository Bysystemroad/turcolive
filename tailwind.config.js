/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#071C33',
        ink: '#0D2944',
        midnight: '#041425',
        cream: '#FAFAF7',
        porcelain: '#F4F7F8',
        linen: '#EEF3F5',
        mist: '#DDE6EB',
        turco: '#E21B24',
        coral: '#F0444C',
        blush: '#FFF0F1',
      },
      boxShadow: {
        soft: '0 24px 70px rgba(7, 28, 51, 0.12)',
        card: '0 18px 45px rgba(7, 28, 51, 0.09)',
        lift: '0 30px 90px rgba(7, 28, 51, 0.16)',
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
