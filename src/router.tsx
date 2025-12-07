import { Route, Routes, Navigate } from 'react-router';

import AdminLayout from './components/layouts/admin/AdminLayout';
import StudentLayout from './components/layouts/student/StudentLayout';

// Admin Pages
import AdminDashboard from './pages/admin';
import AdminStudents from './pages/admin/students';
import AdminTeachers from './pages/admin/teachers';
import AdminClasses from './pages/admin/classes';
import AdminReports from './pages/admin/reports';
import AdminDatabase from './pages/admin/database';
import AdminCourses from './pages/admin/courses';
import AdminExams from './pages/admin/exams';

// Student Pages
import StudentDashboard from './pages/student';
import StudentCourses from './pages/student/courses';
import StudentForums from './pages/student/forums';
import StudentExamsPage from './pages/student/exams';
import StudentGrades from './pages/student/grades';
import CourseDetails from './pages/student/course-details';
import AssignmentDetails from './pages/student/assignment';
import QuizTest from './pages/student/quiz';
import StudentSchedule from './pages/student/schedule';
import StudentProfile from './pages/student/profile';

// Auth
import SignInPage from './pages/sign-in';
import SSOCallback from './pages/sso-callback';

function Router() {
  return (
    <Routes>
      {/* Root redirect to sign-in */}
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      
      {/* Admin Routes with AdminLayout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/classes" element={<AdminClasses />} />
        <Route path="/admin/teachers" element={<AdminTeachers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/database" element={<AdminDatabase />} />
        <Route path="/admin/settings/courses" element={<AdminCourses />} />
        <Route path="/admin/settings/exams" element={<AdminExams />} />
      </Route>

      {/* Student Routes with StudentLayout */}
      <Route element={<StudentLayout />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/course-details" element={<CourseDetails />} />
        <Route path="/student/assignment" element={<AssignmentDetails />} />
        <Route path="/student/quiz" element={<QuizTest />} />
        <Route path="/student/forums" element={<StudentForums />} />
        <Route path="/student/exams" element={<StudentExamsPage />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/schedule" element={<StudentSchedule />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Route>

      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sso-callback" element={<SSOCallback />} />
    </Routes>
  );
}

export default Router;
