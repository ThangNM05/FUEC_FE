import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';

interface ScheduleBlock {
    id: string;
    room: string;
    subject: string;
    subjectCode: string;
    startTime: string;
    endTime: string;
    type: 'lecture' | 'lab' | 'exam' | 'blocked';
    instructor?: string;
}

function AdminSchedule() {
    const [currentDate] = useState(new Date(2026, 1, 9));
    const [viewMode, setViewMode] = useState<'today' | 'week' | 'day'>('day');

    const timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    const classrooms = [
        'Gamma 306',
        'Gamma 307',
        'Gamma 308',
        'Gamma 311',
        'Gamma 312',
        'Gamma 313',
        'Gamma 314'
    ];

    const scheduleBlocks: ScheduleBlock[] = [
        // Gamma 306
        { id: '1', room: 'Gamma 306', subject: 'Mobile App Development', subjectCode: 'MAD101', startTime: '07:30', endTime: '08:30', type: 'lecture' },
        { id: '2', room: 'Gamma 306', subject: 'Computer Network', subjectCode: 'CNT13', startTime: '12:30', endTime: '13:30', type: 'blocked' },

        // Gamma 307
        { id: '3', room: 'Gamma 307', subject: 'Mobile App Development', subjectCode: 'MAD101', startTime: '07:30', endTime: '08:30', type: 'lecture' },
        { id: '4', room: 'Gamma 307', subject: 'Software Development', subjectCode: 'SWD392', startTime: '12:30', endTime: '13:30', type: 'blocked' },

        // Gamma 308
        { id: '5', room: 'Gamma 308', subject: 'Mobile App Development', subjectCode: 'MAD101', startTime: '07:30', endTime: '08:30', type: 'lecture' },
        { id: '6', room: 'Gamma 308', subject: 'Software Development', subjectCode: 'SWD392', startTime: '12:30', endTime: '13:30', type: 'lab' },
        { id: '7', room: 'Gamma 308', subject: 'Software Development', subjectCode: 'SWD392', startTime: '13:30', endTime: '14:25', type: 'exam' },

        // Gamma 311
        { id: '8', room: 'Gamma 311', subject: 'Mobile App Development', subjectCode: 'MAD101', startTime: '07:30', endTime: '08:30', type: 'lecture' },
        { id: '9', room: 'Gamma 311', subject: 'Software Development', subjectCode: 'SWD392', startTime: '13:30', endTime: '15:30', type: 'lecture' },
        { id: '10', room: 'Gamma 311', subject: 'Software Development', subjectCode: 'SWD393', startTime: '15:30', endTime: '16:25', type: 'lecture' },

        // Gamma 312
        { id: '11', room: 'Gamma 312', subject: 'Mobile App Development', subjectCode: 'MAD101', startTime: '07:30', endTime: '08:30', type: 'lecture' },
        { id: '12', room: 'Gamma 312', subject: 'Software Development', subjectCode: 'SWD392', startTime: '13:30', endTime: '15:30', type: 'lecture' },

        // Gamma 313
        { id: '13', room: 'Gamma 313', subject: 'Mobile App Development', subjectCode: 'MAD101', startTime: '07:30', endTime: '08:30', type: 'lecture' },
        { id: '14', room: 'Gamma 313', subject: 'Software Development', subjectCode: 'SWD392', startTime: '13:30', endTime: '15:30', type: 'lecture' },

        // Gamma 314
        { id: '15', room: 'Gamma 314', subject: 'Mobile App Development', subjectCode: 'MAD101', startTime: '07:30', endTime: '08:30', type: 'lecture' },
        { id: '16', room: 'Gamma 314', subject: 'Integrated Development', subjectCode: 'IOD401', startTime: '13:30', endTime: '15:30', type: 'lecture' },
        { id: '17', room: 'Gamma 314', subject: 'Software Development', subjectCode: 'SWD392', startTime: '15:30', endTime: '16:30', type: 'lecture' },
    ];

    const getBlockColor = (type: string) => {
        switch (type) {
            case 'lecture': return 'bg-blue-500';
            case 'lab': return 'bg-green-500';
            case 'exam': return 'bg-yellow-500';
            case 'blocked': return 'bg-gray-500';
            default: return 'bg-blue-500';
        }
    };

    const timeToPosition = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const startHour = 7;
        return ((hours - startHour) * 100 + (minutes / 60) * 100);
    };

    const calculateWidth = (startTime: string, endTime: string) => {
        const start = timeToPosition(startTime);
        const end = timeToPosition(endTime);
        return end - start;
    };

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Schedule Management</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">View and manage class schedules.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#F37022] text-[#F37022] rounded-lg text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#F37022] text-white rounded-lg text-sm font-medium">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                    {/* View Mode Tabs */}
                    <div className="flex gap-2">
                        {(['today', 'week', 'day'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === mode
                                    ? 'bg-[#0A1B3C] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {mode === 'today' ? 'Today' : mode === 'week' ? 'Week' : 'Day'}
                            </button>
                        ))}
                    </div>

                    {/* Date Display */}
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
                            {currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="w-20"></div>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
                <div className="min-w-[1200px]">
                    {/* Time Header */}
                    <div className="flex border-b border-gray-200 mb-2">
                        <div className="w-32 flex-shrink-0 p-2 font-semibold text-sm text-gray-700">Classroom</div>
                        {timeSlots.map((time, index) => (
                            <div key={time} className="flex-1 p-2 text-center text-xs font-semibold text-gray-600 border-l border-gray-200">
                                {time}
                            </div>
                        ))}
                    </div>

                    {/* Schedule Rows */}
                    {classrooms.map((classroom) => (
                        <div key={classroom} className="flex border-b border-gray-100 last:border-b-0 min-h-[60px] relative">
                            <div className="w-32 flex-shrink-0 p-3 flex items-center">
                                <span className="text-sm font-medium text-gray-900">{classroom}</span>
                            </div>
                            <div className="flex-1 relative border-l border-gray-200">
                                {/* Time slot backgrounds */}
                                {timeSlots.map((_, index) => (
                                    <div
                                        key={index}
                                        className="absolute top-0 bottom-0 border-l border-gray-100"
                                        style={{ left: `${(100 / timeSlots.length) * index}%`, width: `${100 / timeSlots.length}%` }}
                                    />
                                ))}

                                {/* Schedule blocks */}
                                {scheduleBlocks
                                    .filter((block) => block.room === classroom)
                                    .map((block) => (
                                        <div
                                            key={block.id}
                                            className={`absolute top-1 ${getBlockColor(block.type)} text-white rounded px-2 py-1 text-xs cursor-pointer hover:opacity-90 transition-opacity`}
                                            style={{
                                                left: `${timeToPosition(block.startTime)}px`,
                                                width: `${calculateWidth(block.startTime, block.endTime)}px`,
                                                maxWidth: 'calc(100% - 8px)'
                                            }}
                                            title={`${block.subject} (${block.subjectCode})\n${block.startTime} - ${block.endTime}`}
                                        >
                                            <div className="font-semibold">{block.startTime} - {block.endTime}</div>
                                            <div className="text-xs opacity-90">{block.subjectCode}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex gap-4 items-center text-sm">
                <span className="text-gray-600">Legend:</span>
                <div className="flex gap-2 items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Lecture</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Lab</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Exam</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span>Blocked</span>
                </div>
            </div>
        </div>
    );
}

export default AdminSchedule;
