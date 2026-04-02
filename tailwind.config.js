/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SaaS Tarzı Yeni Renk Paleti
        primary: "#3b82f6", // Soft Blue
        primaryHover: "#2563eb",
        secondary: "#8b5cf6", // Soft Purple
        success: "#10b981", 
        warning: "#f59e0b",
        danger: "#ef4444",
        
        // Arka Plan Renkleri (Açık Tema)
        surface: "#ffffff",
        background: "#f8fafc",
        section: "#f1f5f9",
        
        // Metin Renkleri
        textPrimary: "#0f172a", // Slate 900
        textSecondary: "#64748b", // Slate 500
        textMuted: "#94a3b8", // Slate 400
        
        borderLight: "#e2e8f0",
      },
      borderRadius: {
        'saas': '16px',
        'saas-lg': '24px',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'premium': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'button': '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
