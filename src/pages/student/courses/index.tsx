import { useState, useEffect } from 'react';
import { Search, ChevronRight, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/authSlice';
import { useGetStudentSubjectsQuery } from '@/api/studentsApi';
import { useGetSemestersQuery } from '@/api/semestersApi';

function StudentCourses() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  // Fetch semesters for the filter
  const { data: semestersData, isLoading: isLoadingSemesters } = useGetSemestersQuery({
    page: 1,
    pageSize: 100,
  });

  const semesters = semestersData?.items || [];

  // Set default semester when data arrives
  useEffect(() => {
    if (semesters.length > 0 && !selectedSemesterId) {
      // Find default semester if possible, or just use the first one
      const current = semesters.find(s => s.isDefault) || semesters[0];
      setSelectedSemesterId(current.id);
    }
  }, [semesters, selectedSemesterId]);

  // Fetch student subjects based on user and selected semester
  const { data: studentSubjectsData, isLoading, isError } = useGetStudentSubjectsQuery(
    {
      studentId: user?.entityId ?? user?.id ?? '',
      semesterId: selectedSemesterId
    },
    { skip: !user?.id || !selectedSemesterId }
  );

  const courses = studentSubjectsData?.map(subject => ({
    id: subject.classSubjectId,
    code: subject.subjectCode,
    name: subject.subjectName,
    instructor: subject.classCode, // Fallback since instructor name isn't in this API yet
    term: semesters.find(s => s.id === selectedSemesterId)?.semesterCode || 'N/A',
    className: subject.classCode,
    schedule: 'N/A',
    room: 'N/A',
    favorited: false
  })) || [];

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">My Courses</h1>
          {isLoadingSemesters ? (
            <div className="w-32 h-9 bg-gray-100 animate-pulse rounded-lg"></div>
          ) : (
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
            >
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.semesterCode}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
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

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#F37022] mb-4" />
          <p className="text-gray-500 font-medium">Loading your courses...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-600 font-medium text-lg">Oops! Something went wrong</p>
          <p className="text-red-400">We couldn't load your courses. Please try again later.</p>
        </div>
      ) : (selectedSemesterId && filteredCourses.length === 0) ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-[#0A1B3C] mb-1">No courses found</h3>
          <p className="text-gray-500 italic">No courses match your search or term selection.</p>
        </div>
      ) : (
        <>
          {/* Card View */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-[#F37022] hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-slideUp"
                  onClick={() => navigate(`/student/course-details/${course.id}`)}
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
                    onClick={() => navigate(`/student/course-details/${course.id}`)}
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
        </>
      )}
    </div>
  );
}

export default StudentCourses;
