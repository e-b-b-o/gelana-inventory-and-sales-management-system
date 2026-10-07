/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0047FF",
        "primary-hover": "#0037C7",
        "brand-warm": "#FFF8E7",
        "warm-border": "#F0E7D0",
        "dark-slate": "#0F172A",
        "muted-text": "#64748B",
        "input-bg": "#F8FAFC",
      },
      boxShadow: {
        'card': '0 24px 48px -12px rgba(15, 23, 42, 0.08), 0 4px 16px -2px rgba(0, 71, 255, 0.04)',
        'btn': '0 10px 24px -6px rgba(0, 71, 255, 0.38)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
