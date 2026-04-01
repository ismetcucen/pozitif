import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * allowedRoles: izin verilen roller dizisi, örn. ['coach', 'admin']
 * Kullanıcı giriş yapmamışsa -> /login
 * Eğer bilgiler hala yükleniyorsa -> Bir saniye beklet (siyah değil!)
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();

  // Eğer bilgiler hala çekiliyorsa kısa bir an bekle ve siyah ekran verme
  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white font-bold">Lütfen bekleyin... ✨</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === 'pending_coach' || userRole === 'pending_student' || userRole === 'rejected') {
    return <Navigate to="/login?reason=pending" replace />;
  }

  // Eğer admin ise coach paneline, eğer öğrenci ise öğrenci paneline geçiş serbest
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Rol uyuşmazlığında ana sayfaya dön
    return <Navigate to="/login" replace />;
  }

  return children;
}
