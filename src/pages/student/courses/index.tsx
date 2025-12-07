import { Search, BookOpen, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

function StudentCourses() {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      name: 'Software Engineering',
      code: 'SWE101',
      instructor: 'Prof. Nguyen Van A',
      schedule: 'Mon, Wed 8:00 AM - 10:00 AM',
      room: 'Room 301',
      progress: 75,
      students: 45,
      status: 'In Progress'
    },
    {
      id: 2,
      name: 'Database Systems',
      code: 'DBS202',
      instructor: 'Prof. Tran Thi B',
      schedule: 'Tue, Thu 10:00 AM - 12:00 PM',
      room: 'Room 205',
      progress: 40,
      students: 38,
      status: 'In Progress'
    },
    {
      id: 3,
      name: 'Web Development',
      code: 'WEB301',
      instructor: 'Prof. Le Van C',
      schedule: 'Wed, Fri 2:00 PM - 4:00 PM',
      room: 'Room 402',
      progress: 60,
      students: 42,
      status: 'In Progress'
    },
    {
      id: 4,
      name: 'Mobile App Development',
      code: 'MAD401',
      instructor: 'Prof. Pham Thi D',
      schedule: 'Mon, Thu 1:00 PM - 3:00 PM',
      room: 'Room 108',
      progress: 90,
      students: 35,
      status: 'Almost Complete'
    }
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">View and manage your enrolled courses.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-medium text-sm">
            <span>Spring 2025</span>
            <BookOpen className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search courses..." className="outline-none text-sm text-gray-900 bg-transparent w-40" />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Enrolled Courses</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {courses.map(course => (
            <div key={course.id} className="border border-gray-200 rounded-xl p-5">
              {/* Course Header */}
              <div className="flex gap-4 mb-4">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 h-7 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg">{course.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{course.code}</p>
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                    course.status === 'Almost Complete' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </div>

              {/* Course Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{course.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.room} • {course.students} students</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/student/course-details')}
                  className="flex-1 px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View Course
                </button>
                <button className="px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                  Materials
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentCourses;
