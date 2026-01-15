import { useState } from 'react';
import { Search, ChevronRight, ArrowRight, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';

function StudentCourses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [semester, setSemester] = useState('SPRING2025');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const courses = [
    {
      id: 1, code: 'SWE101', name: 'Software Engineering',
      instructor: 'Prof. Nguyen Van A', term: 'Spring 2025',
      className: 'SE1801', schedule: 'Mon, Wed 9:00 AM', room: 'Room 301',
      favorited: true
    },
    {
      id: 2, code: 'DBS202', name: 'Database Systems',
      instructor: 'Prof. Tran Thi B', term: 'Spring 2025',
      className: 'DB1802', schedule: 'Wed, Fri 9:00 AM', room: 'Room 206',
      favorited: true
    },
    {
      id: 3, code: 'WEB301', name: 'Web Development',
      instructor: 'Prof. Le Van C', term: 'Spring 2025',
      className: 'WE1801', schedule: 'Thu, Sat 9:00 AM', room: 'Room 402',
      favorited: false
    },
    {
      id: 4, code: 'MAD401', name: 'Mobile App Development',
      instructor: 'Prof. Pham Thi D', term: 'Spring 2025',
      className: 'MA1801', schedule: 'Tue, Thu 2:00 PM', room: 'Room 305',
      favorited: false
    },
    {
      id: 5, code: 'DSA201', name: 'Data Structures',
      instructor: 'Prof. Hoang Van E', term: 'Spring 2025',
      className: 'DS1801', schedule: 'Mon, Wed 2:00 PM', room: 'Room 401',
      favorited: false
    },
  ];

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#0A1B3C]">My Courses</h1>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
            >
              <option value="SPRING2025">Spring 2025</option>
              <option value="FALL2024">Fall 2024</option>
              <option value="SUMMER2024">Summer 2024</option>
            </select>
          </div>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'card'
                ? 'bg-[#F37022] text-white'
                : 'bg-white text-[#0A1B3C] hover:bg-gray-50'
                }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${viewMode === 'list'
                ? 'bg-[#F37022] text-white'
                : 'bg-white text-[#0A1B3C] hover:bg-gray-50'
                }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-[#0A1B3C] placeholder-gray-500 focus:border-[#F37022] focus:ring-1 focus:ring-[#F37022] outline-none transition-all"
            />
          </div>
        </div>

        {/* Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                onClick={() => navigate('/student/course-details')}
              >
                <div className="mb-3">
                  <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2.5 py-1 rounded">
                    {course.code}
                  </span>
                </div>
                <h3 className="font-bold text-[#0A1B3C] text-lg mb-2">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>
                <button className="text-[#1a73e8] text-sm font-medium hover:underline">
                  View course
                </button>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-medium text-[#0A1B3C]">
              <div className="col-span-5">Course</div>
              <div className="col-span-2">Class</div>
              <div className="col-span-4">Schedule</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 cursor-pointer items-center group"
                  onClick={() => navigate('/student/course-details')}
                >
                  <div className="col-span-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">{course.code}</span>
                      <h3 className="font-medium text-[#0A1B3C] group-hover:text-[#F37022] transition-colors">
                        {course.name}
                      </h3>
                      {course.favorited && (
                        <Star className="w-4 h-4 text-[#F39C12] fill-[#F39C12]" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{course.instructor}</p>
                  </div>
                  <div className="col-span-2 text-sm text-[#0A1B3C]">
                    {course.className}
                  </div>
                  <div className="col-span-4 text-sm text-gray-500">
                    {course.schedule} • {course.room}
                  </div>
                  <div className="col-span-1 text-right">
                    <ChevronRight className="w-5 h-5 text-gray-400 inline" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No courses found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCourses;
