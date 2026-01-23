import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter, Calendar } from 'lucide-react';

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
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 9));
    const [viewMode, setViewMode] = useState<'today' | 'week' | 'day'>('day');
    const [selectedBuilding, setSelectedBuilding] = useState<string>('All');
    const [selectedFloor, setSelectedFloor] = useState<string>('All');

    const buildings = ['All', 'Gamma', 'Alpha', 'Beta'];
    const floors = ['All', '1', '2', '3', '4'];

    const timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const totalHours = 12; // 07:00 to 19:00

    const allClassrooms = [
        'Gamma 306',
        'Gamma 307',
        'Gamma 308',
        'Gamma 311',
        'Gamma 312',
        'Gamma 313',
        'Gamma 314',
        'Alpha 101',
        'Alpha 201',
        'Alpha 301',
        'Beta 102',
        'Beta 202',
        'Beta 302'
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

    // Filter classrooms based on building and floor
    const filteredClassrooms = useMemo(() => {
        return allClassrooms.filter(classroom => {
            const [building, roomNumber] = classroom.split(' ');
            const floor = roomNumber.charAt(0);

            const buildingMatch = selectedBuilding === 'All' || building === selectedBuilding;
            const floorMatch = selectedFloor === 'All' || floor === selectedFloor;

            return buildingMatch && floorMatch;
        });
    }, [selectedBuilding, selectedFloor]);

    const getBlockColor = (type: string) => {
        switch (type) {
            case 'lecture': return 'bg-orange-50 border-orange-200';
            case 'lab': return 'bg-blue-50 border-blue-200';
            case 'exam': return 'bg-red-50 border-red-200';
            case 'blocked': return 'bg-gray-100 border-gray-300';
            default: return 'bg-orange-50 border-orange-200';
        }
    };

    const getTextColor = (type: string) => {
        switch (type) {
            case 'lecture': return 'text-[#0A1B3C]';
            case 'lab': return 'text-blue-900';
            case 'exam': return 'text-red-900';
            case 'blocked': return 'text-gray-700';
            default: return 'text-[#0A1B3C]';
        }
    };

    // Convert time to percentage position (0-100%)
    const timeToPosition = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const startHour = 7;
        const totalMinutes = (hours - startHour) * 60 + minutes;
        const totalDisplayMinutes = totalHours * 60;
        return (totalMinutes / totalDisplayMinutes) * 100;
    };

    // Calculate width as percentage
    const calculateWidth = (startTime: string, endTime: string) => {
        const start = timeToPosition(startTime);
        const end = timeToPosition(endTime);
        return end - start;
    };

    // Date navigation functions
    const goToDate = (dateString: string) => {
        if (!dateString) return;
        const selectedDate = new Date(dateString);
        setCurrentDate(selectedDate);
    };

    const goToPreviousDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Schedule Management</h1>
                    <p className="text-gray-600 mt-1">View and manage classroom schedules</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#F37022] text-white rounded-lg text-sm font-medium">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Filters and Date Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filters:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={selectedBuilding}
                                onChange={(e) => setSelectedBuilding(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F37022] focus:border-transparent"
                            >
                                {buildings.map(building => (
                                    <option key={building} value={building}>{building === 'All' ? 'All Buildings' : building}</option>
                                ))}
                            </select>
                            <select
                                value={selectedFloor}
                                onChange={(e) => setSelectedFloor(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F37022] focus:border-transparent"
                            >
                                {floors.map(floor => (
                                    <option key={floor} value={floor}>{floor === 'All' ? 'All Floors' : `Floor ${floor}`}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date Display & View Mode */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* View Mode Tabs */}
                        <div className="flex gap-2">
                            {(['today', 'week', 'day'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === mode
                                        ? 'bg-[#F37022] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {mode === 'today' ? 'Today' : mode === 'week' ? 'Week' : 'Day'}
                                </button>
                            ))}
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={goToPreviousDay}
                                title="Previous day"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Date Display with Calendar Picker */}
                            <div className="relative">
                                <input
                                    type="date"
                                    value={currentDate.toISOString().split('T')[0]}
                                    onChange={(e) => goToDate(e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    title="Select date"
                                />
                                <button className="flex items-center gap-2 text-sm font-semibold text-[#0A1B3C] px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors min-w-[160px] justify-center">
                                    {currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <button
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={goToNextDay}
                                title="Next day"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
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
                    {filteredClassrooms.map((classroom: string) => (
                        <div key={classroom} className="flex border-b border-gray-100 last:border-b-0 min-h-[60px] relative">
                            <div className="w-32 flex-shrink-0 p-3 flex items-center">
                                <span className="text-sm font-medium text-[#0A1B3C]">{classroom}</span>
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
                                            className={`absolute top-1 ${getBlockColor(block.type)} border rounded-lg px-2 py-1 text-xs cursor-pointer hover:shadow-md transition-shadow`}
                                            style={{
                                                left: `${timeToPosition(block.startTime)}%`,
                                                width: `${calculateWidth(block.startTime, block.endTime)}%`,
                                                maxWidth: 'calc(100% - 8px)'
                                            }}
                                            title={`${block.subject} (${block.subjectCode})\n${block.startTime} - ${block.endTime}`}
                                        >
                                            <div className={`font-semibold ${getTextColor(block.type)}`}>{block.startTime} - {block.endTime}</div>
                                            <div className={`text-xs font-medium ${getTextColor(block.type)}`}>{block.subjectCode}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 items-center text-sm">
                <span className="text-gray-600 font-medium">Legend:</span>
                <div className="flex gap-2 items-center">
                    <div className="w-5 h-5 bg-orange-50 border-2 border-orange-200 rounded"></div>
                    <span>Lecture</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-5 h-5 bg-blue-50 border-2 border-blue-200 rounded"></div>
                    <span>Lab</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-5 h-5 bg-red-50 border-2 border-red-200 rounded"></div>
                    <span>Exam</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-5 h-5 bg-gray-100 border-2 border-gray-300 rounded"></div>
                    <span>Blocked</span>
                </div>
            </div>
        </div>
    );
}

export default AdminSchedule;
