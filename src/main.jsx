import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

/**
 * ACİL DURUM HATA RADARI (Error Boundary)
 * Uygulamanın neresinde bir hata olursa olsun, siyah ekran yerine 
 * hatayı açıkça ekrana basar.
 */
class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/40">
            <span className="text-4xl text-red-500">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 italic uppercase tracking-tighter">Bir Hata Oluştu!</h2>
          <pre className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 text-xs max-w-2xl overflow-auto leading-relaxed">
            {this.state.error?.toString() || 'Bilinmeyen bir hata.'}
          </pre>
          <button onClick={() => window.location.reload()} 
            className="mt-8 px-8 py-3 bg-red-500 text-white rounded-xl font-bold font-black hover:opacity-90 transition-opacity">
            Sayfayı Yenile 🔄
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GlobalErrorBoundary>
  </StrictMode>
)
