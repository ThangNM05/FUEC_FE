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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                  onClick={() => navigate('/student/course-details')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold text-white bg-[#0A1B3C] px-2 py-1 rounded">
                      {course.code}
                    </span>
                    {course.newItems > 0 && (
                      <span className="w-5 h-5 bg-[#F37022] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {course.newItems}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#0A1B3C] text-base mb-2 group-hover:text-[#F37022] transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{course.instructor}</p>
                  <button className="text-[#F37022] text-sm font-medium hover:underline flex items-center gap-1">
                    View course <ArrowRight className="w-4 h-4" />
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
                        <span className="text-xs font-medium text-gray-500">{course.code}</span>
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
                      <p className="text-sm font-medium text-[#0A1B3C]">{activity.course}</p>
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
        <div className="w-[300px] border-l border-gray-200 bg-white p-4 hidden lg:block">
          {/* To Do Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0A1B3C] mb-4">To Do</h2>
            <div className="space-y-3">
              {todoItems.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5 group-hover:border-[#F37022] transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A1B3C] hover:text-[#F37022] truncate transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.course}</p>
                      <p className="text-xs text-gray-500">{item.points} pts • {item.dueDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Up Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0A1B3C] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              Coming Up
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#0A1B3C]">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>SWE101 Class - Today 2:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-[#0A1B3C]">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>DBS202 Lab - Tomorrow 9:00 AM</span>
              </div>
            </div>
          </div>

          {/* Recent Feedback Section */}
          <div>
            <h2 className="text-lg font-semibold text-[#0A1B3C] mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-500" />
              Recent Feedback
            </h2>
            <div className="space-y-3">
              {recentFeedback.map((item) => (
                <div key={item.id} className="text-sm">
                  <p className="font-medium text-[#0A1B3C] hover:text-[#F37022] cursor-pointer transition-colors">
                    {item.title}
                  </p>
                  <p className="text-gray-500">{item.course} • {item.grade}</p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
              ))}
            </div>
            <button className="text-sm text-[#F37022] hover:underline mt-3">
              View Grades →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
