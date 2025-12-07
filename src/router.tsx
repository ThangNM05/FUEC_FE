import { Route, Routes } from 'react-router';

import DashboardLayout from './components/layouts/dashboard/layout';
import LandingLayout from './components/layouts/landing/layout';
import AdminLayout from './components/layouts/admin/AdminLayout';
import BookingPage from './pages/booking';
import AdminDashboard from './pages/dashboard/admin';
import AdminStudents from './pages/dashboard/admin-students';
import AdminTeachers from './pages/dashboard/admin-teachers';
import AdminClasses from './pages/dashboard/admin-classes';
import AdminReports from './pages/dashboard/admin-reports';
import AdminDatabase from './pages/dashboard/admin-database';
import AdminCourses from './pages/dashboard/admin-courses';
import AdminExams from './pages/dashboard/admin-exams';
import StudentManagement from './pages/dashboard/student-management';
import TeacherManagement from './pages/dashboard/teacher-management';
import HomePage from './pages/home';
import SignInPage from './pages/sign-in';
import SSOCallback from './pages/sso-callback';

function Router() {
  return (
    <>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/student-management" element={<StudentManagement />} />
          <Route path="/teacher-management" element={<TeacherManagement />} />
        </Route>
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
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sso-callback" element={<SSOCallback />} />
      </Routes>
    </>
  );
}

export default Router;



