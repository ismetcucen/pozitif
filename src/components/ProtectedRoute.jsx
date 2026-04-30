import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * allowedRoles: izin verilen roller dizisi, örn. ['coach', 'admin']
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500">PozitifKoç hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Rol kontrolü — eğer rol izin listesinde değilse doğru panele yönlendir
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const coachRoles = ['coach', 'admin', 'super_admin', 'kurucu'];
    if (coachRoles.includes(userRole)) {
      return <Navigate to="/coach/dashboard" replace />;
    }
    if (userRole === 'student') {
      return <Navigate to="/student/dashboard/program" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
