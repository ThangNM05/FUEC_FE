import { Route } from 'react-router';

import AdminLayout from './components/layouts/admin/AdminLayout';
import AdminDashboard from './pages/admin';
import AdminStudents from './pages/admin/students';
import AdminTeachers from './pages/admin/teachers';
import AdminClasses from './pages/admin/classes';
import AdminReports from './pages/admin/reports';
import AdminDatabase from './pages/admin/database';
import AdminCourses from './pages/admin/courses';
import AdminExams from './pages/admin/exams';
import SignInPage from './pages/sign-in';
import SSOCallback from './pages/sso-callback';

function Router() {
  return (
    <>
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
    </>
  );
}

export default Router;
