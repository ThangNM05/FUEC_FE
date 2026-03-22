import { useState } from 'react';
import {
  ChevronRight,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/authSlice';

function StudentDashboard() {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const toggleCheckbox = (id: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const user = useSelector(selectCurrentUser);

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

  const recentActivity = [
    { courseId: '1', courseCode: 'SWE101', title: 'Important: Project deadline extended', time: '2 hours ago' },
    { courseId: '2', courseCode: 'DBS202', title: 'Assignment 2 has been submitted', time: '5 hours ago' },
    { courseId: '3', courseCode: 'WEB301', title: 'Quiz 2 has been graded: 45/50', time: '1 day ago' },
    { courseId: '4', courseCode: 'MAD401', title: 'New reply in "Flutter vs React Native"', time: '2 days ago' },
  ];

  return (
    <div className="flex animate-fadeIn">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Welcome back, {user?.fullName || 'Student'}!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your courses.</p>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div
            onClick={() => navigate('/student/courses')}
            className="p-6 bg-gradient-to-br from-[#F37022] to-[#ff9b5e] rounded-xl text-white cursor-pointer hover:shadow-lg transition-all group"
          >
            <h3 className="text-xl font-bold mb-2">My Courses</h3>
            <p className="text-white/80 text-sm">View all your enrolled subjects and their details.</p>
            <div className="mt-4 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Go to Courses <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div
            onClick={() => navigate('/student/schedule')}
            className="p-6 bg-gradient-to-br from-[#0066b3] to-[#0092ff] rounded-xl text-white cursor-pointer hover:shadow-lg transition-all group"
          >
            <h3 className="text-xl font-bold mb-2">My Schedule</h3>
            <p className="text-white/80 text-sm">Check your upcoming classes and exam slots.</p>
            <div className="mt-4 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform">
              View Schedule <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Recent Activity View */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-[#0A1B3C]">Recent Activity</h2>
            <button className="text-xs text-[#F37022] font-semibold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex-1">
                  <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded inline-block mb-1">{activity.courseCode}</span>
                  <p className="text-sm text-gray-700 font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 self-center" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[320px] border-l border-gray-200 bg-gray-50/50 p-4 hidden lg:block space-y-4">
        {/* To Do Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="text-lg font-bold text-[#1a1f36] mb-4">To Do</h2>
          <div className="space-y-4">
            {todoItems.map((item) => {
              const isChecked = checkedItems[item.id] || false;
              return (
                <div key={item.id} className="flex items-start gap-3 group">
                  <button
                    onClick={() => toggleCheckbox(item.id)}
                    className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${isChecked
                      ? 'bg-[#F37022] border-[#F37022]'
                      : 'border-2 border-gray-200 group-hover:border-gray-300'
                      }`}
                  >
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-[#1a1f36] truncate ${isChecked ? 'line-through text-gray-400' : ''}`}>{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-[#0066b3] bg-blue-50 px-1.5 py-0.5 rounded uppercase">{item.course}</span>
                      <p className="text-[10px] text-gray-400">{item.dueDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-4 py-2 text-xs font-semibold text-[#F37022] bg-[#F37022]/5 hover:bg-[#F37022]/10 rounded-lg transition-colors">
            Show more
          </button>
        </div>

        {/* Recent Feedback Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="text-lg font-bold text-[#1a1f36] mb-4">Recent Feedback</h2>
          <div className="space-y-4">
            {recentFeedback.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-[#1a1f36] truncate flex-1">{item.title}</p>
                  <span className="text-xs font-bold text-[#27ae60] bg-green-50 px-2 py-0.5 rounded ml-2">{item.grade}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-bold text-[#0066b3] uppercase">{item.course}</span>
                  <p className="text-[10px] text-gray-400">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
