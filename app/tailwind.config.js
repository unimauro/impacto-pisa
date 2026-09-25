/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ground: 'rgb(var(--ground) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        ink2: 'rgb(var(--ink2) / <alpha-value>)',
        ink3: 'rgb(var(--ink3) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        agua: 'rgb(var(--agua) / <alpha-value>)',
        mina: 'rgb(var(--mina) / <alpha-value>)',
        edu: 'rgb(var(--edu) / <alpha-value>)',
        salud: 'rgb(var(--salud) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Newsreader"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
