import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleItem {
  slot: number;
  day: string;
  course: string;
  code: string;
  room: string;
}

function StudentSchedule() {
  const [currentWeek, setCurrentWeek] = useState(0);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Different schedules for different weeks
  const weeklySchedules: { [key: number]: ScheduleItem[] } = {
    0: [
      { slot: 1, day: 'Monday', course: 'Software Engineering', code: 'SWE101', room: 'Room 301' },
      { slot: 1, day: 'Wednesday', course: 'Software Engineering', code: 'SWE101', room: 'Room 301' },
      { slot: 2, day: 'Monday', course: 'Database Systems', code: 'DBS202', room: 'Room B205' },
      { slot: 2, day: 'Thursday', course: 'Database Systems', code: 'DBS202', room: 'Room B205' },
      { slot: 3, day: 'Friday', course: 'Data Structures', code: 'DSA101', room: 'Room A102' },
    ],
    1: [
      { slot: 1, day: 'Tuesday', course: 'Web Development', code: 'WEB301', room: 'Lab C301' },
      { slot: 1, day: 'Friday', course: 'Web Development', code: 'WEB301', room: 'Lab C301' },
      { slot: 2, day: 'Wednesday', course: 'Mobile App Development', code: 'MAD401', room: 'Lab D102' },
      { slot: 3, day: 'Thursday', course: 'Database Systems', code: 'DBS202', room: 'Room B205' },
    ],
    2: [
      { slot: 1, day: 'Monday', course: 'Software Engineering', code: 'SWE101', room: 'Room 301' },
      { slot: 1, day: 'Wednesday', course: 'Software Engineering', code: 'SWE101', room: 'Room 301' },
      { slot: 2, day: 'Tuesday', course: 'Web Development', code: 'WEB301', room: 'Lab C301' },
      { slot: 2, day: 'Thursday', course: 'Database Systems', code: 'DBS202', room: 'Room B205' },
      { slot: 3, day: 'Friday', course: 'Data Structures', code: 'DSA101', room: 'Room A102' },
    ],
  };

  const getCurrentSchedule = (): ScheduleItem[] => {
    return weeklySchedules[currentWeek % 3] || weeklySchedules[0];
  };

  const schedule = getCurrentSchedule();

  const getClassForSlot = (slot: number, day: string): ScheduleItem | undefined => {
    return schedule.find(item => item.slot === slot && item.day === day);
  };

  // Calculate week display
  const getWeekDisplay = () => {
    const baseDate = new Date('2026-01-05');
    const weekStart = new Date(baseDate);
    weekStart.setDate(baseDate.getDate() + currentWeek * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Weekly Schedule</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm md:text-base text-gray-600">Your class timetable for this week.</p>

          {/* Week Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-sm font-medium text-gray-700 min-w-[180px] text-center">
              {getWeekDisplay()}
            </div>
            <button
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Grid - Desktop View */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-[#0A1B3C] min-w-[100px]">Time</th>
              {weekDays.map(day => (
                <th key={day} className="border border-gray-200 p-3 text-center text-sm font-semibold text-[#0A1B3C] min-w-[140px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((slot) => (
              <tr key={slot}>
                <td className="border border-gray-200 p-3 bg-gray-50 font-medium text-sm text-gray-700">
                  Slot {slot}
                </td>
                {weekDays.map((day) => {
                  const classItem = getClassForSlot(slot, day);
                  return (
                    <td key={day} className="border border-gray-200 p-3 align-top">
                      {classItem ? (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="font-semibold text-[#0A1B3C] text-sm mb-1">{classItem.course}</div>
                          <div className="text-xs font-semibold text-[#F37022] bg-white px-2 py-0.5 rounded inline-block mb-1">
                            {classItem.code}
                          </div>
                          <div className="text-xs text-gray-600">{classItem.room}</div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-300">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentSchedule;
