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
        "primary-container": "#0047FF", // for icons/bg
        "on-primary": "#FFFFFF",
        "primary-fixed": "#DDE1FF", // Pale blue background
        
        "surface": "#F6F8FB",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F1F3FF",
        "surface-container": "#E8EEFE",
        
        "on-surface": "#161C27",
        "on-surface-variant": "#434657",
        
        "outline": "#747688",
        "outline-variant": "#E2E7EE",
        
        "success": "#0D824C",
        "success-container": "#EBF8F1",
        
        "error": "#D92D20",
        "error-container": "#FEE4E2",
        
        "warning": "#A16207",
        "warning-container": "#FEF9C3",
        
        "cream": "#FFF8E7",
        "cream-border": "#F0E7D0",
      },
      fontFamily: {
        "sans": ["Plus Jakarta Sans", "sans-serif"],
        "headline-sm": ["Plus Jakarta Sans"],
        "body-md": ["Plus Jakarta Sans"],
        "body-sm": ["Plus Jakarta Sans"],
        "label-md": ["Plus Jakarta Sans"],
        "label-sm": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
        "label-lg": ["Plus Jakarta Sans"],
        "headline-xl": ["Plus Jakarta Sans"],
        "body-lg": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"]
      },
      fontSize: {
        "headline-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
        "label-md": ["12px", { "lineHeight": "16px", "fontWeight": "600" }],
        "label-sm": ["11px", { "lineHeight": "14px", "fontWeight": "600" }],
        "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
        "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
        "headline-xl": ["32px", { "lineHeight": "40px", "fontWeight": "700" }],
        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }]
      },
      boxShadow: {
        'card': '0 24px 48px -12px rgba(15, 23, 42, 0.08), 0 4px 16px -2px rgba(0, 71, 255, 0.04)',
        'btn': '0 10px 24px -6px rgba(0, 71, 255, 0.38)',
        'sm': '0 1px 3px rgba(30, 36, 48, 0.04), 0 1px 2px rgba(30, 36, 48, 0.02)',
      },
      spacing: {
        "space-lg": "1.5rem",
        "space-md": "1rem",
        "space-sm": "0.5rem",
        "space-xs": "0.25rem",
        "margin": "2rem",
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
