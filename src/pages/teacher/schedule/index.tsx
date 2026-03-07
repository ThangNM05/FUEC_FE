import { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetTeacherScheduleQuery } from '@/api/teachersApi';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';

// Interfaces for our API response
interface SyllabusSessionDto {
    slotSessionId: string;
    sessionOrder: number;
    syllabusSessionId: string;
    sessionNumber: number;
    topic: string;
    learningTeachingType: string;
    ituSkills: string;
    studentTasks: string;
}

interface ScheduleSlotDto {
    slotId: string;
    classId: string;
    classCode: string;
    classSubjectId: string;
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    slotIndex: number;
    date: string;
    endDate: string;
    room: string;
    sessions: SyllabusSessionDto[];
}

export default function TeacherSchedule() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calculate the start (Monday) and end (Sunday) of the current week focus
    const weekStart = useMemo(() => {
        const date = new Date(currentDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(date.setDate(diff));
    }, [currentDate]);

    const weekEnd = useMemo(() => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + 6);
        return date;
    }, [weekStart]);

    // Format dates for API query (YYYY-MM-DD)
    const startDateStr = weekStart.toISOString().split('T')[0];
    const endDateStr = weekEnd.toISOString().split('T')[0];

    // Fetch schedule data for the week
    const { data: scheduleData, isFetching, error } = useGetTeacherScheduleQuery({
        startDate: startDateStr,
        endDate: endDateStr
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const slots = [
        { index: 1, time: '7:00 - 9:15', period: 'Slot 1' },
        { index: 2, time: '9:30 - 11:45', period: 'Slot 2' },
        { index: 3, time: '12:30 - 14:45', period: 'Slot 3' },
        { index: 4, time: '15:00 - 17:15', period: 'Slot 4' },
        { index: 5, time: '17:30 - 19:45', period: 'Slot 5' },
        { index: 6, time: '20:00 - 22:15', period: 'Slot 6' }
    ];

    // Helpers to get dates
    const getDates = () => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const dates = getDates();

    const previousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getTimeFromDateString = (dateString: string) => {
        // extracts "07:00" from "2026-03-02T07:00:00"
        return dateString.split('T')[1].substring(0, 5);
    };

    const getScheduleItem = (date: Date, slotIndex: number) => {
        if (!scheduleData) return null;

        const dateStr = date.toISOString().split('T')[0];
        const targetTime = slots.find(s => s.index === slotIndex)?.time.split(' - ')[0]; // E.g., "7:00" or "9:30"

        // Pad with leading zero if needed so "7:00" matches "07:00"
        const formattedTargetTime = targetTime && targetTime.length === 4 ? `0${targetTime}` : targetTime;

        return scheduleData.find((item: any) => {
            const itemDateStr = item.date.split('T')[0];
            const itemTimeStr = getTimeFromDateString(item.date);
            return itemDateStr === dateStr && itemTimeStr === formattedTargetTime;
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Teaching Schedule</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white rounded-lg border p-1 border-gray-200/60 shadow-sm">
                        <Button variant="ghost" size="icon" onClick={previousWeek} className="h-8 w-8 text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 px-3 text-sm font-medium text-gray-700 justify-center bg-gray-50 rounded-md py-1 border border-gray-200">
                            <ConfigProvider
                                theme={{
                                    token: {
                                        colorPrimary: '#F37022',
                                    },
                                    components: {
                                        DatePicker: {
                                            activeBorderColor: 'transparent',
                                            hoverBorderColor: 'transparent',
                                        }
                                    }
                                }}
                            >
                                <DatePicker
                                    variant="borderless"
                                    allowClear={false}
                                    value={dayjs(currentDate)}
                                    onChange={(date) => {
                                        if (date) {
                                            setCurrentDate(date.toDate());
                                        }
                                    }}
                                    className="w-32 cursor-pointer font-medium text-gray-700 bg-transparent p-0"
                                    format="MMM D, YYYY"
                                />
                            </ConfigProvider>
                        </div>
                        <Button variant="ghost" size="icon" onClick={nextWeek} className="h-8 w-8 text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="glass-card overflow-hidden rounded-xl border-orange-100/50 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr>
                                    <th className="w-24 min-w-[6rem] border-b border-r bg-gray-50/50 p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider backdrop-blur-sm whitespace-nowrap">
                                        Time
                                    </th>
                                    {dates.map((date, index) => (
                                        <th
                                            key={index}
                                            className={`border-b border-r p-2 text-center w-[13.1%] ${isToday(date) ? 'bg-orange-50/50 backdrop-blur-sm relative overflow-hidden' : 'bg-gray-50/50 backdrop-blur-sm'
                                                }`}
                                        >
                                            {isToday(date) && (
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
                                            )}
                                            <div className={`text-sm font-bold ${isToday(date) ? 'text-orange-700' : 'text-gray-900'}`}>
                                                {days[index]}
                                            </div>
                                            <div className={`text-xs mt-1 ${isToday(date) ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                                                {formatDate(date)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isFetching ? (
                                    Array.from({ length: 6 }).map((_, index) => (
                                        <tr key={`loading-${index}`}>
                                            <td className="border-b border-r bg-gray-50/50 p-2 text-center h-12">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse w-12 mx-auto mb-1"></div>
                                                <div className="h-3 bg-gray-100 rounded animate-pulse w-16 mx-auto"></div>
                                            </td>
                                            {Array.from({ length: 7 }).map((_, colIndex) => (
                                                <td key={`loading-col-${colIndex}`} className="border-b border-r p-1 align-top h-10">
                                                    <div className="h-full w-full bg-gray-50/50 rounded animate-pulse"></div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-red-500">
                                            Error loading schedule. Please check your connection or contact support.
                                        </td>
                                    </tr>
                                ) : slots.map((slot) => (
                                    <tr key={slot.index}>
                                        <td className="border-b border-r bg-gray-50/50 p-2 text-center text-xs font-medium text-gray-700 backdrop-blur-sm h-12 whitespace-nowrap">
                                            <div className="font-semibold">{slot.period}</div>
                                            <div className="text-gray-500 mt-1">{slot.time}</div>
                                        </td>
                                        {dates.map((date, dateIndex) => {
                                            const scheduleItem = getScheduleItem(date, slot.index);
                                            return (
                                                <td key={dateIndex} className="border-b border-r p-1 align-top h-10">
                                                    {scheduleItem ? (
                                                        <div
                                                            className="h-full w-full animate-in fade-in duration-300 cursor-pointer"
                                                            onClick={() => navigate(`/teacher/course-details/${scheduleItem.classSubjectId}`)}
                                                        >
                                                            <div className="h-full rounded border border-orange-200 bg-orange-50/80 p-1.5 hover:bg-orange-100 hover:border-orange-300 transition-all shadow-sm">
                                                                <div className="font-bold text-sm text-orange-900 mb-1 leading-tight flex justify-between items-start">
                                                                    <span>{scheduleItem.subjectCode}</span>
                                                                    <span className="text-[10px] bg-orange-200 text-orange-800 px-1 py-0.5 rounded font-medium">Slot {scheduleItem.slotIndex}</span>
                                                                </div>

                                                                <div className="space-y-0.5 opacity-90">
                                                                    <div className="flex items-center text-xs text-orange-800">
                                                                        <User className="mr-1 h-3 w-3 shrink-0 text-orange-600" />
                                                                        <span className="flex-1 truncate"><span className="font-semibold">{scheduleItem.classCode}</span></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-gray-300 text-xs">-</div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

