import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

function StudentSchedule() {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  const schedule = [
    { day: 'Monday', time: '08:00 - 10:00', course: 'Software Engineering', code: 'SWE101', room: 'Room 301', teacher: 'Prof. Nguyen Van A' },
    { day: 'Monday', time: '10:30 - 12:30', course: 'Database Systems', code: 'DBS202', room: 'Room B205', teacher: 'Prof. Tran Thi B' },
    { day: 'Tuesday', time: '14:00 - 16:00', course: 'Web Development', code: 'WEB301', room: 'Lab C301', teacher: 'Prof. Le Van C' },
    { day: 'Wednesday', time: '08:00 - 10:00', course: 'Software Engineering', code: 'SWE101', room: 'Room 301', teacher: 'Prof. Nguyen Van A' },
    { day: 'Wednesday', time: '14:00 - 17:00', course: 'Mobile App Development', code: 'MAD401', room: 'Lab D102', teacher: 'Prof. Pham Thi D' },
    { day: 'Thursday', time: '10:30 - 12:30', course: 'Database Systems', code: 'DBS202', room: 'Room B205', teacher: 'Prof. Tran Thi B' },
    { day: 'Friday', time: '08:00 - 10:00', course: 'Data Structures', code: 'DSA101', room: 'Room A102', teacher: 'Prof. Hoang Van E' },
    { day: 'Friday', time: '14:00 - 16:00', course: 'Web Development', code: 'WEB301', room: 'Lab C301', teacher: 'Prof. Le Van C' }
  ];

  const getScheduleForDay = (day: string) => {
    return schedule.filter(item => item.day === day);
  };

  const colors = ['bg-orange-100 border-orange-300', 'bg-blue-100 border-blue-300', 'bg-green-100 border-green-300', 'bg-purple-100 border-purple-300', 'bg-pink-100 border-pink-300'];
  const courseColors: { [key: string]: string } = {};
  let colorIndex = 0;

  schedule.forEach(item => {
    if (!courseColors[item.code]) {
      courseColors[item.code] = colors[colorIndex % colors.length];
      colorIndex++;
    }
  });

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Weekly Schedule</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Your class timetable for this week.</p>
      </div>
      
      {/* Schedule Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {weekDays.map(day => (
                  <th key={day} className="p-4 text-left font-semibold text-gray-900 min-w-[200px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weekDays.map(day => (
                  <td key={day} className="p-3 align-top border-r border-gray-100 last:border-0">
                    <div className="space-y-3">
                      {getScheduleForDay(day).map((item, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${courseColors[item.code]}`}
                        >
                          <div className="font-medium text-gray-900 text-sm">{item.course}</div>
                          <div className="text-xs text-gray-600 mt-1">{item.code}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                            <Clock className="w-3 h-3" /> {item.time}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" /> {item.room}
                          </div>
                        </div>
                      ))}
                      {getScheduleForDay(day).length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-4">No classes</div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          {weekDays.map(day => (
            <div key={day} className="border-b border-gray-200 last:border-0">
              <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-900">{day}</div>
              <div className="p-3 space-y-3">
                {getScheduleForDay(day).length > 0 ? (
                  getScheduleForDay(day).map((item, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${courseColors[item.code]}`}
                    >
                      <div className="font-medium text-gray-900">{item.course}</div>
                      <div className="text-sm text-gray-600">{item.code}</div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {item.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {item.room}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm py-4">No classes</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentSchedule;
