/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-primary": "#4edea3", "on-surface": "#131b2e", "outline-variant": "#bbcabf",
        "primary-fixed-dim": "#4edea3", "on-error": "#ffffff", "secondary": "#b90538",
        "surface-container-lowest": "#ffffff", "primary-container": "#10b981",
        "secondary-container": "#dc2c4f", "error": "#ba1a1a", "surface-bright": "#faf8ff",
        "on-primary-fixed": "#002113", "surface-container-high": "#e2e7ff",
        "error-container": "#ffdad6", "on-primary-fixed-variant": "#005236",
        "on-secondary-container": "#fffbff", "tertiary": "#855300",
        "surface-container": "#eaedff", "surface": "#faf8ff", "surface-variant": "#dae2fd",
        "primary-fixed": "#6ffbbe", "surface-dim": "#d2d9f4",
        "on-surface-variant": "#3c4a42", "surface-tint": "#006c49",
        "on-secondary-fixed-variant": "#92002a", "tertiary-container": "#e29100",
        "outline": "#6c7a71", "on-primary": "#ffffff", "on-tertiary": "#ffffff",
        "on-secondary-fixed": "#40000d", "on-tertiary-fixed-variant": "#653e00",
        "background": "#faf8ff", "inverse-on-surface": "#eef0ff",
        "on-error-container": "#93000a", "inverse-surface": "#283044",
        "surface-container-highest": "#dae2fd", "primary": "#006c49",
        "secondary-fixed-dim": "#ffb2b7", "on-tertiary-container": "#523200",
        "tertiary-fixed": "#ffddb8", "on-tertiary-fixed": "#2a1700",
        "tertiary-fixed-dim": "#ffb95f", "surface-container-low": "#f2f3ff",
        "secondary-fixed": "#ffdadb", "on-secondary": "#ffffff",
        "on-background": "#131b2e", "on-primary-container": "#00422b"
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
      spacing: {
        "space-sm": "0.5rem", "space-xs": "0.25rem", "space-xl": "1.75rem",
        "gutter": "0.75rem", "margin": "1rem", "space-md": "0.875rem", "space-lg": "1.25rem"
      },
      fontFamily: {
        "body-lg": ["Noto Sans"], "headline-lg-mobile": ["Plus Jakarta Sans"],
        "headline-sm": ["Plus Jakarta Sans"], "japanese-card": ["Noto Sans"],
        "body-sm": ["Noto Sans"], "headline-lg": ["Plus Jakarta Sans"],
        "japanese-hero": ["Noto Sans"], "japanese-ruby": ["Noto Sans"],
        "label-md": ["Plus Jakarta Sans"], "body-md": ["Noto Sans"],
        "headline-md": ["Plus Jakarta Sans"], "stat-counter": ["Plus Jakarta Sans"],
        "label-sm": ["Plus Jakarta Sans"]
      },
      fontSize: {
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "headline-lg-mobile": ["26px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "700" }],
        "japanese-card": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "japanese-hero": ["48px", { lineHeight: "56px", fontWeight: "700" }],
        "japanese-ruby": ["12px", { lineHeight: "14px", fontWeight: "500" }],
        "label-md": ["13px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "700" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-md": ["22px", { lineHeight: "28px", fontWeight: "700" }],
        "stat-counter": ["15px", { lineHeight: "18px", fontWeight: "800" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.06em", fontWeight: "700" }]
      }
    }
  },
  plugins: []
}
