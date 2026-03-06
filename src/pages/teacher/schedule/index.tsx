import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function TeacherSchedule() {
    const [currentWeek, setCurrentWeek] = useState(0);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const timeSlots = [
        { id: 1, time: '7:00 - 9:15', period: 'Slot 1' },
        { id: 2, time: '9:30 - 11:45', period: 'Slot 2' },
        { id: 3, time: '12:30 - 14:45', period: 'Slot 3' },
        { id: 4, time: '15:00 - 17:15', period: 'Slot 4' },
        { id: 5, time: '17:30 - 19:45', period: 'Slot 5' },
        { id: 6, time: '20:00 - 22:15', period: 'Slot 6' }
    ];

    const schedule: Record<string, Record<number, { course: string; code: string; room: string; class: string } | null>> = {
        Monday: {
            2: { course: 'Database Systems', code: 'DBS202', room: 'Room 301', class: 'SE1801' },
            4: { course: 'Database Systems', code: 'DBS202', room: 'Room 302', class: 'SE1802' }
        },
        Wednesday: {
            2: { course: 'Database Systems', code: 'DBS202', room: 'Room 301', class: 'SE1801' },
            3: { course: 'Web Development', code: 'WEB301', room: 'Room 205', class: 'SE1803' }
        },
        Thursday: {
            5: { course: 'Data Structures', code: 'DSA201', room: 'Room 108', class: 'SE1804' }
        },
        Friday: {
            1: { course: 'Web Development', code: 'WEB301', room: 'Room 205', class: 'SE1803' },
            4: { course: 'Database Systems', code: 'DBS202', room: 'Room 302', class: 'SE1802' }
        }
    };

    // Calculate week display in "January 5-11, 2026" format
    const getWeekDisplay = () => {
        const baseDate = new Date('2026-01-05');
        const weekStart = new Date(baseDate);
        weekStart.setDate(baseDate.getDate() + currentWeek * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const startMonth = monthNames[weekStart.getMonth()];
        const endMonth = monthNames[weekEnd.getMonth()];
        const startDay = weekStart.getDate();
        const endDay = weekEnd.getDate();
        const year = weekEnd.getFullYear();

        if (weekStart.getMonth() === weekEnd.getMonth()) {
            return `${startMonth} ${startDay}-${endDay}, ${year}`;
        } else {
            return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
        }
    };

    const goToDate = (dateString: string) => {
        if (!dateString) return;

        const selectedDate = new Date(dateString);
        const baseDate = new Date('2026-01-05'); // Monday of first week

        const diffTime = selectedDate.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diffDays / 7);

        setCurrentWeek(weekNumber);
    };

    // Get date for each day column
    const getDayDate = (dayIndex: number) => {
        const baseDate = new Date('2026-01-05'); // Monday of first week
        const weekStart = new Date(baseDate);
        weekStart.setDate(baseDate.getDate() + currentWeek * 7 + dayIndex);

        const day = weekStart.getDate();
        const month = weekStart.getMonth() + 1;
        const year = weekStart.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">My Schedule</h1>

                    {/* Week Navigation */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentWeek(currentWeek - 1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Previous week"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Date Range with Calendar Icon */}
                        <div className="relative">
                            <input
                                type="date"
                                onChange={(e) => goToDate(e.target.value)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                title="Jump to specific date"
                            />
                            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                                {getWeekDisplay()}
                                <Calendar className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        <button
                            onClick={() => setCurrentWeek(currentWeek + 1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Next week"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-200 p-3 text-left text-sm font-semibold text-[#0A1B3C] min-w-[100px]">Time</th>
                            {daysOfWeek.map((day, index) => (
                                <th key={day} className="border border-gray-200 p-3 text-center text-sm font-semibold text-[#0A1B3C] min-w-[140px]">
                                    <div>{day}</div>
                                    <div className="text-xs font-normal text-gray-500 mt-1">{getDayDate(index)}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((timeSlot) => (
                            <tr key={timeSlot.id}>
                                <td className="border border-gray-200 p-3 bg-gray-50 font-medium text-sm text-gray-700">
                                    <div className="font-semibold">{timeSlot.period}</div>
                                </td>
                                {daysOfWeek.map((day) => {
                                    const classItem = schedule[day]?.[timeSlot.id];
                                    return (
                                        <td key={day} className="border border-gray-200 p-3 align-top">
                                            {classItem ? (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                    <div className="font-semibold text-[#0A1B3C] text-sm mb-1">{classItem.course}</div>
                                                    <div className="text-xs font-semibold text-[#0066b3] bg-white px-2 py-0.5 rounded inline-block mb-2">
                                                        {classItem.code}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mb-2">{classItem.room}</div>
                                                    <div className="text-xs font-medium text-gray-700 block mb-2">Class: {classItem.class}</div>
                                                    <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block whitespace-nowrap">
                                                        {timeSlot.time}
                                                    </div>
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

export default TeacherSchedule;
