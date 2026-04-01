/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // Slate-900 (Karanlık Arka Plan)
        surface: '#1e293b',    // Slate-800 (Birincil Kart Zemini)
        surfaceHover: '#334155', // Slate-700
        primary: '#6b4cff',    // Orijinal Pozitif Koç Moru (Daha modern)
        primaryHover: '#5a3de0',
        secondary: '#0ea5e9',  // Turkuaz / Gök Mavisi (Kontrast İçin)
        text: '#ffffff',       // Tam Beyaz (Karanlıkta Netlik)
        textMuted: '#94a3b8',  // Gümüş Gri
        border: '#334155',     // Slate-700 Sınır Çizgileri
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
