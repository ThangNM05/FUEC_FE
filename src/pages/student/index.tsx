import { useState, useEffect } from 'react';
import { Search, FileText, Clipboard, Award, ChevronLeft, ChevronRight, BookOpen, AlertCircle, Bell, Calendar, Clock } from 'lucide-react';

function StudentDashboard() {
  const [progressAnimated, setProgressAnimated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setProgressAnimated(true), 100);
  }, []);

  const scheduleData: { [key: string]: { time: string; subject: string; room: string; teacher: string }[] } = {
    '2024-05-13': [
      { time: '09:00 - 11:00', subject: 'Web Development', room: 'C302', teacher: 'Dr. Le Van C' }
    ],
    '2024-05-09': [
      { time: '08:00 - 10:00', subject: 'Software Engineering', room: 'A101', teacher: 'Dr. Nguyen Van A' },
      { time: '13:00 - 15:00', subject: 'Database Systems', room: 'B205', teacher: 'Dr. Tran Thi B' }
    ]
  };

  const announcements = [
    {
      id: 1,
      category: 'University News',
      title: 'Important Update on Final Exam Schedules',
      description: 'Please note that the final exam schedule for the Fall 2024 semester has been updated. Check the Exam Schedule page for the latest details.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      category: 'Academic',
      title: 'New AI-Powered Study Tools Available',
      description: 'EduConnect now features AI-powered study assistants to help you prepare for exams and complete assignments more efficiently.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop'
    }
  ];

  const courses = [
    { id: 1, name: 'Software Engineering', code: 'SWE101', progress: 75 },
    { id: 2, name: 'Database Systems', code: 'DBS202', progress: 40 },
    { id: 3, name: 'Web Development', code: 'WEB301', progress: 60 }
  ];

  const deadlines = [
    { id: 1, title: 'SWE101 Assignment 2', due: 'Tomorrow, 11:59 PM', icon: FileText },
    { id: 2, title: 'DBS202 Midterm Quiz', due: 'In 3 days', icon: Clipboard },
    { id: 3, title: 'WEB301 Project Proposal', due: 'Next Monday', icon: Award }
  ];

  const currentMonth = 'May 2024';
  const calendarDays = [
    { day: 28, otherMonth: true },
    { day: 29, otherMonth: true },
    { day: 30, otherMonth: true },
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 },
    { day: 9, today: true, date: '2024-05-09' }, { day: 10 }, { day: 11 },
    { day: 12 }, { day: 13, hasEvent: true, date: '2024-05-13' }, { day: 14 }, { day: 15 },
    { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 },
    { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 },
    { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 },
    { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 },
    { day: 1, otherMonth: true }
  ];

  const handleDateClick = (dayObj: any) => {
    if (!dayObj.otherMonth && dayObj.date) {
      setSelectedDate(dayObj.date);
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, An!</h1>
          <p className="text-gray-600 mt-1">Here's a summary of your academic activities.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-gray-200 w-full lg:w-80">
          <Search className="w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search courses, forums, users..." className="flex-1 outline-none text-sm text-gray-900 bg-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
              <a href="#" className="text-orange-500 text-sm font-medium hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {announcements.map(announcement => (
                <div key={announcement.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <img src={announcement.image} alt="" className="w-24 h-20 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2.5 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold mb-2">
                      {announcement.category}
                    </span>
                    <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{announcement.description}</p>
                    <button className="mt-3 px-4 py-2 bg-[#F37022] text-white text-sm font-semibold rounded-lg hover:bg-[#D96419]">
                      Read More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Courses */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
              <a href="#" className="text-orange-500 text-sm font-medium hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {courses.map(course => (
                <div key={course.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-500">{course.code}</p>
                  </div>
                  <div className="flex items-center gap-3 w-48">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#F37022] rounded-full transition-all duration-1000"
                        style={{ width: progressAnimated ? `${course.progress}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-10">{course.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">2 new</span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Schedule Change</h4>
                  <p className="text-xs text-gray-600 mt-0.5">LAB class this week has been rescheduled to Friday 2PM</p>
                  <span className="text-xs text-gray-400">10 minutes ago</span>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <Bell className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Assignment Reminder</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Software Engineering assignment due tomorrow</p>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
              </div>
              <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Exam Schedule Posted</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Midterm exam schedule is now available</p>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
            <div className="space-y-3">
              {deadlines.map(deadline => {
                const Icon = deadline.icon;
                return (
                  <div key={deadline.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{deadline.title}</h4>
                      <p className="text-xs text-gray-500">Due: {deadline.due}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{currentMonth}</h3>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="py-2 font-medium text-gray-500">{day}</div>
              ))}
              {calendarDays.map((dayObj, index) => (
                <div
                  key={index}
                  className={`py-2 rounded cursor-pointer text-sm ${
                    dayObj.otherMonth ? 'text-gray-300' : 
                    dayObj.today ? 'bg-[#F37022] text-white font-bold' :
                    dayObj.hasEvent ? 'bg-orange-100 text-orange-600 font-medium' :
                    'hover:bg-gray-100'
                  }`}
                  onClick={() => handleDateClick(dayObj)}
                >
                  {dayObj.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-[90%]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold">Schedule for {selectedDate}</h3>
              <button onClick={() => setSelectedDate(null)} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
            </div>
            {scheduleData[selectedDate] ? (
              <div className="space-y-3">
                {scheduleData[selectedDate].map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm mb-2">
                      <Clock className="w-4 h-4" />
                      <span>{item.time}</span>
                    </div>
                    <div className="font-bold text-gray-900">{item.subject}</div>
                    <div className="text-sm text-gray-600">Room {item.room} • {item.teacher}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">No classes scheduled</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
