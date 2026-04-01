import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CoachLayout from './components/CoachLayout';
import StudentLayout from './components/StudentLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';

// Coach Pages
import CoachDashboardHome from './pages/CoachDashboardHome';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Library from './pages/Library';
import University from './pages/University';
import Appointments from './pages/Appointments';
import Payments from './pages/Payments';
import AdminPanel from './pages/AdminPanel';
import WeeklyPlan from './pages/WeeklyPlan';
import Tasks from './pages/Tasks';
import LiveLessons from './pages/LiveLessons';
import Exams from './pages/Exams';
import Notes from './pages/Notes';
import AI from './pages/AI';
import Schedule from './pages/Schedule';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ParentView from './pages/student/ParentView';
import Leaderboard from './pages/student/Leaderboard';

// Public Pages
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/coach-login" element={<Login mode="coach" />} />
        <Route path="/student-login" element={<Login mode="student" />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        {/* Admin Panel - Direkt erişim */}
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

        <Route path="/student-login" element={<Login mode="student" />} />
        <Route path="/coach-login" element={<Login mode="coach" />} />

        {/* Coach Routes - Sadece 'coach' ve 'admin' rolleri */}
        <Route 
          path="/coach" 
          element={
            <ProtectedRoute allowedRoles={['coach', 'admin', 'super_admin', 'kurucu']}>
              <CoachLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/coach/dashboard" replace />} />
          <Route path="dashboard" element={<CoachDashboardHome />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="payments" element={<Payments />} />
          <Route path="library" element={<Library />} />
          <Route path="university" element={<University />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="weekly-plan" element={<WeeklyPlan />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="live-lessons" element={<LiveLessons />} />
          <Route path="exams" element={<Exams />} />
          <Route path="notes" element={<Notes />} />
          <Route path="ai" element={<AI />} />
          <Route path="schedule" element={<Schedule />} />
        </Route>
        
        {/* Student Routes - Sadece 'student' rolü */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="parent" element={<ParentView />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
