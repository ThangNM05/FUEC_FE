import { useState } from 'react';
import {
  ChevronRight, FileText, MessageSquare,
  Bell, CheckCircle, Clock, Calendar, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router';

function StudentDashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'activity'>('card');
  const [semester, setSemester] = useState('SPRING2025');
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const toggleCheckbox = (id: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const courses = [
    { id: 1, code: 'SWE101', name: 'Software Engineering', term: 'Spring 2025', instructor: 'Prof. Nguyen Van A', newItems: 3 },
    { id: 2, code: 'DBS202', name: 'Database Systems', term: 'Spring 2025', instructor: 'Prof. Tran Thi B', newItems: 1 },
    { id: 3, code: 'WEB301', name: 'Web Development', term: 'Spring 2025', instructor: 'Prof. Le Van C', newItems: 0 },
    { id: 4, code: 'MAD401', name: 'Mobile App Development', term: 'Spring 2025', instructor: 'Prof. Pham Thi D', newItems: 5 },
    { id: 5, code: 'DSA201', name: 'Data Structures', term: 'Spring 2025', instructor: 'Prof. Hoang Van E', newItems: 0 },
    { id: 6, code: 'NET301', name: 'Computer Networks', term: 'Spring 2025', instructor: 'Prof. Vu Thi F', newItems: 2 },
  ];

  const todoItems = [
    { id: 1, title: 'Assignment 2: Database Design', course: 'DBS202', dueDate: 'Jan 11 at 11:59pm', points: 100 },
    { id: 2, title: 'Quiz 3: JavaScript Basics', course: 'WEB301', dueDate: 'Jan 12 at 11:59pm', points: 50 },
    { id: 3, title: 'Lab Report: ER Diagrams', course: 'DBS202', dueDate: 'Jan 13 at 5:00pm', points: 25 },
    { id: 4, title: 'Project Proposal', course: 'SWE101', dueDate: 'Jan 15 at 11:59pm', points: 150 },
  ];

  const recentFeedback = [
    { id: 1, title: 'Assignment 1', course: 'SWE101', grade: '95/100', date: '2 days ago' },
    { id: 2, title: 'Midterm Exam', course: 'DBS202', grade: '88/100', date: '5 days ago' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#0A1B3C]">Dashboard</h1>
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
          <div className="flex items-center gap-2">
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
              <button
                onClick={() => setViewMode('activity')}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${viewMode === 'activity'
                  ? 'bg-[#F37022] text-white'
                  : 'bg-white text-[#0A1B3C] hover:bg-gray-50'
                  }`}
              >
                Recent Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Card View - Simple Style */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                  onClick={() => navigate('/student/course-details')}
                >
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-[#F37022] bg-orange-50 px-2.5 py-1 rounded">
                      {course.code}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#0A1B3C] text-lg mb-2">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>
                  <button className="text-[#0066CC] text-sm font-medium hover:underline">
                    View course
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-[#0A1B3C]">My Courses</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer group"
                    onClick={() => navigate('/student/course-details')}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#F37022] bg-orange-50 px-2 py-0.5 rounded">{course.code}</span>
                        <h3 className="font-medium text-[#0A1B3C] group-hover:text-[#F37022] transition-colors">
                          {course.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500">{course.instructor} • {course.term}</p>
                    </div>
                    {course.newItems > 0 && (
                      <span className="mr-3 text-xs text-[#F37022] font-medium">
                        {course.newItems} new
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity View */}
          {viewMode === 'activity' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-[#0A1B3C]">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  { course: 'SWE101', title: 'Important: Project deadline extended', time: '2 hours ago' },
                  { course: 'DBS202', title: 'Assignment 2 has been submitted', time: '5 hours ago' },
                  { course: 'WEB301', title: 'Quiz 2 has been graded: 45/50', time: '1 day ago' },
                  { course: 'MAD401', title: 'New reply in "Flutter vs React Native"', time: '2 days ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start px-4 py-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-[#F37022] bg-orange-50 px-2 py-0.5 rounded inline-block mb-1">{activity.course}</span>
                      <p className="text-sm text-gray-600">{activity.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-[300px] border-l border-gray-200 bg-gray-50 p-4 hidden lg:block space-y-3">
          {/* To Do Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-[#1a1f36] mb-4">To Do</h2>
            <div className="space-y-4">
              {todoItems.map((item) => {
                const isChecked = checkedItems[item.id] || false;
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <button
                      onClick={() => toggleCheckbox(item.id)}
                      className={`w-4 h-4 rounded flex-shrink-0 mt-1 flex items-center justify-center transition-colors ${isChecked
                        ? 'bg-[#F37022] border-[#F37022]'
                        : 'border border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1a1f36] mb-1">{item.title}</p>
                      <p className="text-xs font-semibold text-[#F37022] bg-orange-50 px-2 py-0.5 rounded inline-block mb-1">{item.course}</p>
                      <p className="text-xs text-gray-400">{item.points} pts    {item.dueDate}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coming Up Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-[#1a1f36] mb-4">Coming Up</h2>
            <div className="space-y-4">
              {todoItems.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-start gap-0">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1a1f36] mb-1">{item.title}</p>
                    <p className="text-xs font-semibold text-[#F37022] bg-orange-50 px-2 py-0.5 rounded inline-block mb-1">{item.course}</p>
                    <p className="text-xs text-gray-400">{item.points} pts    {item.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feedback Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-[#1a1f36] mb-4">Recent Feedback</h2>
            <div className="space-y-4">
              {recentFeedback.map((item) => (
                <div key={item.id} className="flex items-start gap-0">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1a1f36] mb-1">{item.title}</p>
                    <p className="text-xs font-semibold text-[#F37022] bg-orange-50 px-2 py-0.5 rounded inline-block mb-1">{item.course}</p>
                    <p className="text-xs text-gray-400">{item.grade}    {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
