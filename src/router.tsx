import { Route,Routes } from 'react-router';

import DashboardLayout from './components/layouts/dashboard/layout';
import LandingLayout from './components/layouts/landing/layout';
import BookingPage from './pages/booking';
import StudentManagement from './pages/dashboard/student-management';
import TeacherManagement from './pages/dashboard/teacher-management';
import HomePage from './pages/home';
import SignInPage from './pages/sign-in';

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
        <Route path="/sign-in" element={<SignInPage />} />
      </Routes>
    </>
  );
}

export default Router;
