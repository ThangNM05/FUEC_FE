import { Navigate, Route, Routes } from 'react-router';

import AdminLayout from './components/layouts/admin/AdminLayout';
import StudentLayout from './components/layouts/student/StudentLayout';
// Admin Pages
import AdminDashboard from './pages/admin';
import AdminClasses from './pages/admin/classes';
import AdminCourses from './pages/admin/courses';
import AdminQuestionBanks from './pages/admin/question-banks';
import AdminQuestionBankDetail from './pages/admin/question-banks/detail';
import AdminExams from './pages/admin/exams';
import AdminSchedule from './pages/admin/schedule';
import AdminStudents from './pages/admin/students';
import AdminTeachers from './pages/admin/teachers';
// Admin Settings Pages

import AdminClassrooms from './pages/admin/settings/classrooms';
import AdminSubjects from './pages/admin/settings/subjects';
import AdminExamTypes from './pages/admin/settings/exam-types';
import AdminSemesters from './pages/admin/settings/semesters';
import AdminCurriculum from './pages/admin/settings/curriculum';
import AdminSyllabus from './pages/admin/settings/syllabus';
// Auth
import SignInPage from './pages/sign-in';
// Student Pages
import StudentDashboard from './pages/student';
import AssignmentDetails from './pages/student/assignment';
import CourseDetails from './pages/student/course-details';
import StudentCourses from './pages/student/courses';
import StudentExamsPage from './pages/student/exams';
import StudentForums from './pages/student/forums';
import StudentGrades from './pages/student/grades';
import StudentProfile from './pages/student/profile';
import QuizTest from './pages/student/quiz';
import ExamLobby from './pages/student/exam-lobby';
import StudentSchedule from './pages/student/schedule';
// Teacher Components
import TeacherLayout from './components/layouts/teacher/TeacherLayout';
// Teacher Pages
import TeacherDashboard from './pages/teacher';
import TeacherClassrooms from './pages/teacher/classrooms';
import TeacherSchedule from './pages/teacher/schedule';
import TeacherReports from './pages/teacher/reports';
import TeacherMessages from './pages/teacher/messages';
import StudentMessages from './pages/student/messages';
import QuestionDetail from './pages/student/questions/detail';
import AssignmentSubmission from './pages/student/assignment-submission';
import TeacherAssignmentReview from './pages/teacher/assignment-review';
import TeacherCourseDetails from './pages/teacher/course-details';
import AssignmentSubmissionsList from './pages/teacher/assignment-submissions';
import TeacherQuestionBanks from './pages/teacher/question-banks';
import TeacherQuestionBankDetail from './pages/teacher/question-banks/detail';
import CreateExam from './pages/teacher/create-exam';
import TeacherExamReview from './pages/teacher/exam-review';
import ProfilePage from './pages/common/ProfilePage';
import AdminMajors from './pages/admin/settings/majors';
import NotFoundPage from './pages/not-found';

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
        <Route path="/admin/schedule" element={<AdminSchedule />} />
        <Route path="/admin/question-banks" element={<AdminQuestionBanks />} />
        <Route path="/admin/question-banks/:subjectId" element={<AdminQuestionBankDetail />} />
        <Route path="/admin/settings/courses" element={<AdminCourses />} />
        <Route path="/admin/settings/exams" element={<AdminExams />} />
        <Route path="/admin/settings/majors" element={<AdminMajors />} />

        <Route path="/admin/settings/classrooms" element={<AdminClassrooms />} />
        <Route path="/admin/settings/subjects" element={<AdminSubjects />} />
        <Route path="/admin/settings/exam-types" element={<AdminExamTypes />} />
        <Route path="/admin/settings/semesters" element={<AdminSemesters />} />
        <Route path="/admin/settings/curriculum" element={<AdminCurriculum />} />
        <Route path="/admin/settings/syllabus" element={<AdminSyllabus />} />
      </Route>

      {/* Student Routes with StudentLayout */}
      <Route element={<StudentLayout />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/course-details/:classSubjectId" element={<CourseDetails />} />
        <Route path="/student/assignment" element={<AssignmentDetails />} />
        <Route path="/student/exam-lobby/:examId" element={<ExamLobby />} />
        <Route path="/student/quiz" element={<QuizTest />} />
        <Route path="/student/forums" element={<StudentForums />} />
        <Route path="/student/exams" element={<StudentExamsPage />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/schedule" element={<StudentSchedule />} />
        <Route path="/student/profile" element={<ProfilePage />} />
        <Route path="/student/messages" element={<StudentMessages />} />
        <Route path="/student/course-details/questions/:id" element={<QuestionDetail />} />
        <Route path="/student/assignment-submission/:id" element={<AssignmentSubmission />} />
      </Route>

      {/* Teacher Routes with TeacherLayout */}
      <Route element={<TeacherLayout />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/classrooms" element={<TeacherClassrooms />} />
        <Route path="/teacher/schedule" element={<TeacherSchedule />} />
        <Route path="/teacher/messages" element={<TeacherMessages />} />
        <Route path="/teacher/question-banks" element={<TeacherQuestionBanks />} />
        <Route path="/teacher/question-banks/:subjectId" element={<TeacherQuestionBankDetail />} />
        <Route path="/teacher/create-exam" element={<CreateExam />} />
        <Route path="/teacher/course-details/:courseId" element={<TeacherCourseDetails />} />
        <Route path="/teacher/exam-review/:studentExamId" element={<TeacherExamReview />} />
        <Route path="/teacher/assignment/:assignmentId/submissions" element={<AssignmentSubmissionsList />} />
        <Route path="/teacher/assignment-review/:submissionId" element={<TeacherAssignmentReview />} />
        <Route path="/teacher/reports" element={<TeacherReports />} />
        <Route path="/teacher/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/sign-in" element={<SignInPage />} />

      {/* 404 Not Found - catch all unmatched routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default Router;
