import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function TeacherSchedule() {
    const [currentWeek, setCurrentWeek] = useState(0);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const timeSlots = [
        { id: 1, time: '7:00 - 8:30', period: 'Slot 1' },
        { id: 2, time: '8:40 - 10:10', period: 'Slot 2' },
        { id: 3, time: '10:20 - 11:50', period: 'Slot 3' },
        { id: 4, time: '12:50 - 14:20', period: 'Slot 4' },
        { id: 5, time: '14:30 - 16:00', period: 'Slot 5' },
        { id: 6, time: '16:10 - 17:40', period: 'Slot 6' }
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

    const getWeekDates = (weekOffset: number) => {
        const baseDate = new Date('2026-01-05'); // Monday of first week
        const startDate = new Date(baseDate.getTime() + (weekOffset * 7 * 24 * 60 * 60 * 1000));
        return daysOfWeek.map((_, index) => {
            const date = new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000));
            return date;
        });
    };

    const weekDates = getWeekDates(currentWeek);

    const previousWeek = () => setCurrentWeek(curr => curr - 1);
    const nextWeek = () => setCurrentWeek(curr => curr + 1);
    const goToToday = () => {
        const today = new Date();
        const baseDate = new Date('2026-01-05');
        const diffTime = today.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diffDays / 7);
        setCurrentWeek(weekNumber);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">My Schedule</h1>

                <div className="flex items-center gap-3">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-white border border-gray-300 text-[#0A1B3C] text-sm font-medium rounded-lg hover:bg-gray-50"
                    >
                        Today
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={previousWeek}
                            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-5 h-5 text-[#0A1B3C]" />
                        </button>
                        <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg min-w-[200px] text-center">
                            <span className="text-sm font-medium text-[#0A1B3C]">
                                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <button
                            onClick={nextWeek}
                            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <ChevronRight className="w-5 h-5 text-[#0A1B3C]" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
                Your teaching schedule for this week.
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 text-left text-sm font-semibold text-gray-700 min-w-[120px]">
                                    Time
                                </th>
                                {daysOfWeek.map((day, index) => {
                                    const date = weekDates[index];
                                    const isToday = date.toDateString() === new Date().toDateString();
                                    return (
                                        <th
                                            key={day}
                                            className={`p-4 text-center text-sm font-semibold min-w-[150px] ${isToday ? 'text-[#F37022] bg-orange-50' : 'text-gray-700'
                                                }`}
                                        >
                                            <div>{day}</div>
                                            <div className={`text-xs font-normal ${isToday ? 'text-[#F37022]' : 'text-gray-500'}`}>
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.map((timeSlot) => (
                                <tr key={timeSlot.id} className="border-b border-gray-100">
                                    <td className="p-4 bg-gray-50 border-r border-gray-200">
                                        <div className="text-sm font-medium text-[#0A1B3C]">{timeSlot.period}</div>
                                        <div className="text-xs text-gray-500">{timeSlot.time}</div>
                                    </td>
                                    {daysOfWeek.map((day) => {
                                        const classItem = schedule[day]?.[timeSlot.id];
                                        return (
                                            <td key={day} className="p-2 align-top">
                                                {classItem ? (
                                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 h-full">
                                                        <div className="font-semibold text-[#0A1B3C] text-sm mb-1">{classItem.course}</div>
                                                        <div className="text-xs font-semibold text-[#0066b3] bg-white px-2 py-0.5 rounded inline-block mb-2">
                                                            {classItem.code}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mb-1">{classItem.room}</div>
                                                        <div className="text-xs font-medium text-gray-700">Class: {classItem.class}</div>
                                                    </div>
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
                    <span>Teaching Slot</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-50 rounded"></div>
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
}

export default TeacherSchedule;
