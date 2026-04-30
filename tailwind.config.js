/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minimalist & Professional Theme Palette
        primary: "#111827", // Very dark gray/black (sophisticated base)
        primaryHover: "#1f2937",
        secondary: "#6366f1", // Elegant Indigo accent
        secondaryHover: "#4f46e5",
        success: "#10b981", 
        warning: "#f59e0b",
        danger: "#ef4444",
        
        // Background Colors (Clean, high contrast)
        surface: "#ffffff",
        background: "#f9fafb", // Gray 50
        section: "#f3f4f6", // Gray 100
        
        // Text Colors
        textPrimary: "#111827", // Gray 900
        textSecondary: "#4b5563", // Gray 600
        textMuted: "#9ca3af", // Gray 400
        
        borderLight: "#e5e7eb", // Gray 200
      },
      borderRadius: {
        'saas': '12px',      // Slightly tighter radius for a sharper, more professional look
        'saas-lg': '16px',
      },
      boxShadow: {
        'soft': '0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.01)',
        'premium': '0 10px 20px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.02)',
        'button': '0 4px 10px -2px rgba(0,0,0,0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0,0,0,0.02)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
