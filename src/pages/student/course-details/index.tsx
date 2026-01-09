import { ArrowLeft, BookOpen, FileText, Download, Play, CheckCircle, Clock, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';

function CourseDetails() {
  const navigate = useNavigate();
  
  const course = {
    name: 'Software Engineering',
    code: 'SWE101',
    instructor: 'Prof. Nguyen Van A',
    schedule: 'Mon, Wed 8:00 AM - 10:00 AM',
    room: 'Room 301',
    credits: 3
  };

  const materials = [
    { id: 1, title: 'Week 1: Introduction to Software Engineering', type: 'Lecture', date: '2024-05-01', downloadable: true },
    { id: 2, title: 'Assignment 1: Requirements Analysis', type: 'Assignment', date: '2024-05-03', due: '2024-05-10', submitted: true },
    { id: 3, title: 'Week 2: Design Patterns', type: 'Lecture', date: '2024-05-08', downloadable: true },
    { id: 4, title: 'Lab 1: UML Diagrams', type: 'Lab', date: '2024-05-10', downloadable: true },
    { id: 5, title: 'Assignment 2: Design Patterns', type: 'Assignment', date: '2024-05-10', due: '2024-05-17', submitted: false }
  ];

  const progressTests = [
    { id: 1, title: 'Quiz 1: OOP Fundamentals', questions: 20, duration: 30, status: 'completed', score: 85 },
    { id: 2, title: 'Midterm Exam', questions: 50, duration: 90, status: 'available', score: null },
    { id: 3, title: 'Quiz 2: Design Patterns', questions: 15, duration: 20, status: 'locked', score: null }
  ];

  const announcements = [
    { id: 1, title: 'Midterm Exam Schedule', content: 'The midterm exam will be held on May 15, 2024', date: '2 days ago' },
    { id: 2, title: 'Assignment 2 Posted', content: 'New assignment on Design Patterns is now available', date: '1 week ago' }
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/student/courses')} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.name}</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">{course.code} • {course.instructor}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignments */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Assignments</h2>
            <div className="space-y-3">
              {materials.filter(m => m.type === 'Assignment').map(material => (
                <div key={material.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{material.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">{material.type}</span>
                      {material.due && <span className="text-xs text-gray-500">Due: {material.due}</span>}
                      {material.submitted && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                  <button 
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      material.submitted 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-[#F37022] text-white hover:bg-[#D96419]'
                    }`}
                    onClick={() => navigate('/student/assignment')}
                  >
                    {material.submitted ? 'View Submission' : 'Submit'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Materials */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Learning Materials</h2>
            <div className="space-y-3">
              {materials.filter(m => m.type !== 'Assignment').map(material => (
                <div key={material.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{material.title}</h4>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{material.type}</span>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Tests */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Progress Tests & Quizzes</h2>
            <div className="space-y-4">
              {progressTests.map(test => (
                <div key={test.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{test.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>{test.questions} questions</span>
                        <span>{test.duration} minutes</span>
                      </div>
                    </div>
                    {test.status === 'completed' && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{test.score}%</div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                    )}
                  </div>
                  {test.status === 'available' ? (
                    <button 
                      className="w-full px-4 py-2.5 bg-[#F37022] text-white rounded-lg font-medium hover:bg-[#D96419] flex items-center justify-center gap-2"
                      onClick={() => navigate('/student/quiz')}
                    >
                      <Play className="w-4 h-4" /> Start Test
                    </button>
                  ) : test.status === 'completed' ? (
                    <button className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
                      View Results
                    </button>
                  ) : (
                    <button className="w-full px-4 py-2.5 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2" disabled>
                      <Lock className="w-4 h-4" /> Locked
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Announcements</h2>
            <div className="space-y-3">
              {announcements.map(announcement => (
                <div key={announcement.id} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                  <span className="text-xs text-gray-500">{announcement.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Assignment 2</h4>
                  <p className="text-xs text-red-600">Due: Tomorrow</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Midterm Exam</h4>
                  <p className="text-xs text-orange-600">Due: In 3 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Course Info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Instructor</span>
                <p className="font-medium text-gray-900">{course.instructor}</p>
              </div>
              <div>
                <span className="text-gray-500">Schedule</span>
                <p className="font-medium text-gray-900">{course.schedule}</p>
              </div>
              <div>
                <span className="text-gray-500">Room</span>
                <p className="font-medium text-gray-900">{course.room}</p>
              </div>
              <div>
                <span className="text-gray-500">Credits</span>
                <p className="font-medium text-gray-900">{course.credits} credits</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
