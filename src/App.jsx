import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CoachLayout from './components/CoachLayout';
import StudentLayout from './components/StudentLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { usePresence } from './hooks/usePresence';

// Lazy loading components
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Payment = lazy(() => import('./pages/Payment'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Coach Pages
const CoachDashboardHome = lazy(() => import('./pages/CoachDashboardHome'));
const CoachDashboard = lazy(() => import('./pages/coach/CoachDashboard'));
const Students = lazy(() => import('./pages/Students'));
const StudentDetail = lazy(() => import('./pages/coach/StudentDetail'));
const Library = lazy(() => import('./pages/Library'));
const Settings = lazy(() => import('./pages/Settings'));
const University = lazy(() => import('./pages/University'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Payments = lazy(() => import('./pages/Payments'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const WeeklyPlan = lazy(() => import('./pages/WeeklyPlan'));
const Tasks = lazy(() => import('./pages/Tasks'));
const LiveLessons = lazy(() => import('./pages/LiveLessons'));
const Exams = lazy(() => import('./pages/Exams'));
const Notes = lazy(() => import('./pages/Notes'));
const AI = lazy(() => import('./pages/AI'));
const Schedule = lazy(() => import('./pages/Schedule'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const ParentView = lazy(() => import('./pages/student/ParentView'));
const CoachDirectory = lazy(() => import('./pages/student/CoachDirectory'));
const ExamAnalysis = lazy(() => import('./pages/student/ExamAnalysis'));
const FocusMode = lazy(() => import('./pages/student/FocusMode'));
const StudentPreview = lazy(() => import('./pages/StudentPreview'));

// Public Pages
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

// Loading Fallback
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">PozitifKoç Yükleniyor...</p>
    </div>
  </div>
);

function StudentParentRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={`/student/parent/${currentUser.uid}`} replace />;
}

function AppContent() {
  usePresence();
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/coach-login" element={<Login mode="coach" />} />
        <Route path="/student-login" element={<Login mode="student" />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        
        {/* Admin Panel */}
        <Route 
          path="/admin-panel" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'kurucu']}>
              <CoachLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminPanel />} />
        </Route>

        {/* Coach Routes */}
        <Route 
          path="/coach" 
          element={
            <ProtectedRoute allowedRoles={['coach', 'admin', 'super_admin', 'kurucu']}>
              <CoachLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/coach/dashboard" replace />} />
          <Route path="dashboard" element={<CoachDashboard />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="home" element={<CoachDashboardHome />} />
          <Route path="admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'kurucu']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="students" element={<Students />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="payments" element={<Payments />} />
          <Route path="library" element={<Library />} />
          <Route path="university" element={<University />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="live-lessons" element={<LiveLessons />} />
          <Route path="weekly-plan" element={<WeeklyPlan />} />
          <Route path="weekly-plan/:studentId" element={<WeeklyPlan />} />
          <Route path="tasks/:studentId" element={<Tasks />} />
          <Route path="exams/:studentId" element={<Exams />} />
          <Route path="notes/:studentId" element={<Notes />} />
          <Route path="settings" element={<Settings />} />
          <Route path="ai" element={<AI />} />
          <Route path="schedule" element={<Schedule />} />
        </Route>
        
        {/* Student Routes */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard/program" replace />} />
          <Route path="dashboard" element={<Navigate to="/student/dashboard/program" replace />} />
          <Route path="dashboard/:tab" element={<StudentDashboard />} />
          <Route path="exam-analysis" element={<ExamAnalysis />} />
          <Route path="focus" element={<FocusMode />} />
          <Route path="parent/:studentId" element={<ParentView />} />
          <Route path="parent" element={<StudentParentRedirect />} />
          <Route path="coaches" element={<CoachDirectory />} />
        </Route>

        <Route path="/parent/:studentId" element={<ParentView />} />
        <Route path="/student-preview" element={<StudentPreview />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <AppContent />
    </Router>
  );
}

export default App;
