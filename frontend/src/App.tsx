import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/ui/page-transition";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentAbsences from "./pages/student/StudentAbsences";
import StudentCourses from "./pages/student/StudentCourses";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentExams from "./pages/student/StudentExams";
import StudentProfile from "./pages/student/StudentProfile";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherTimetable from "./pages/teacher/TeacherTimetable";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherJustifications from "./pages/teacher/TeacherJustifications";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherAnnouncements from "./pages/teacher/TeacherAnnouncements";
import TeacherProfile from "./pages/teacher/TeacherProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminAdministrators from "./pages/admin/AdminAdministrators";
import AdminTimetables from "./pages/admin/AdminTimetables";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminDisciplinary from "./pages/admin/AdminDisciplinary";
import AdminProfile from "./pages/admin/AdminProfile";

const queryClient = new QueryClient();

const PT: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PageTransition>{children}</PageTransition>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p>Chargement...</p></div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PT><HomePage /></PT>} />
      <Route path="/login" element={<PT><LoginPage /></PT>} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><PT><StudentDashboard /></PT></ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['student']}><PT><StudentTimetable /></PT></ProtectedRoute>} />
      <Route path="/student/absences" element={<ProtectedRoute allowedRoles={['student']}><PT><StudentAbsences /></PT></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['student']}><PT><StudentCourses /></PT></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><PT><StudentAssignments /></PT></ProtectedRoute>} />
      <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['student']}><PT><StudentExams /></PT></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><PT><StudentProfile /></PT></ProtectedRoute>} />

      {/* Teacher Routes */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><PT><TeacherDashboard /></PT></ProtectedRoute>} />
      <Route path="/teacher/timetable" element={<ProtectedRoute allowedRoles={['teacher']}><PT><TeacherTimetable /></PT></ProtectedRoute>} />
      <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><PT><TeacherAttendance /></PT></ProtectedRoute>} />
      <Route path="/teacher/justifications" element={<ProtectedRoute allowedRoles={['teacher']}><PT><TeacherJustifications /></PT></ProtectedRoute>} />
      <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={['teacher']}><PT><TeacherCourses /></PT></ProtectedRoute>} />
      <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><PT><TeacherAssignments /></PT></ProtectedRoute>} />
      <Route path="/teacher/announcements" element={<ProtectedRoute allowedRoles={['teacher']}><PT><TeacherAnnouncements /></PT></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute allowedRoles={['teacher']}><PT><TeacherProfile /></PT></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><PT><AdminDashboard /></PT></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><PT><AdminStudents /></PT></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><PT><AdminTeachers /></PT></ProtectedRoute>} />
      <Route path="/admin/administrators" element={<ProtectedRoute allowedRoles={['admin']}><PT><AdminAdministrators /></PT></ProtectedRoute>} />
      <Route path="/admin/timetables" element={<ProtectedRoute allowedRoles={['admin']}><PT><AdminTimetables /></PT></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><PT><AdminAnnouncements /></PT></ProtectedRoute>} />
      <Route path="/admin/disciplinary" element={<ProtectedRoute allowedRoles={['admin']}><PT><AdminDisciplinary /></PT></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><PT><AdminProfile /></PT></ProtectedRoute>} />

      <Route path="*" element={<PT><NotFound /></PT>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
