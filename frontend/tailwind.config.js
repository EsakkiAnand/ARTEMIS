/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        panel: '#111827',
        primary: '#00F0FF',
        secondary: '#00B8D9',
        success: '#00E676',
        danger: '#FF3D00',
        warning: '#FFC107',
        borderGlow: '#00F0FF80',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
