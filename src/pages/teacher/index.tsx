import { useState } from 'react';
import { ChevronRight, ChevronDown, Users, FileText, Calendar, Clock, ArrowRight, AlertCircle, ChevronLeft, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';

function TeacherDashboard() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
    const [semester, setSemester] = useState('SPRING2025');
    const [activeSidebarPanel, setActiveSidebarPanel] = useState<'grading' | 'classes' | 'stats' | null>(null);

    // Courses with multiple classes
    const courses = [
        {
            id: 1,
            code: 'SWE101',
            name: 'Software Engineering',
            term: 'Spring 2025',
            totalStudents: 125,
            pendingGrading: 15,
            classes: [
                { id: 'a', name: 'SE1801', students: 42, room: 'Room 301', schedule: 'Mon, Wed 9:00 AM' },
                { id: 'b', name: 'SE1802', students: 45, room: 'Room 302', schedule: 'Mon, Wed 2:00 PM' },
                { id: 'c', name: 'SE1803', students: 38, room: 'Room 303', schedule: 'Tue, Thu 9:00 AM' },
            ]
        },
        {
            id: 2,
            code: 'DBS202',
            name: 'Database Systems',
            term: 'Spring 2025',
            totalStudents: 80,
            pendingGrading: 8,
            classes: [
                { id: 'a', name: 'DB1801', students: 40, room: 'Room 205', schedule: 'Tue, Thu 2:00 PM' },
                { id: 'b', name: 'DB1802', students: 40, room: 'Room 206', schedule: 'Wed, Fri 9:00 AM' },
            ]
        },
        {
            id: 3,
            code: 'WEB301',
            name: 'Web Development',
            term: 'Spring 2025',
            totalStudents: 42,
            pendingGrading: 0,
            classes: [
                { id: 'a', name: 'WE1801', students: 42, room: 'Room 402', schedule: 'Thu, Sat 9:00 AM' },
            ]
        },
    ];

    const todoItems = [
        { id: 1, title: 'Grade Assignment 2', course: 'SWE101', submissions: 12, dueDate: 'Today' },
        { id: 2, title: 'Grade Quiz 3', course: 'DBS202', submissions: 38, dueDate: 'Tomorrow' },
        { id: 3, title: 'Review Project Proposals', course: 'WEB301', submissions: 8, dueDate: 'Jan 13' },
    ];

    const upcomingClasses = [
        { id: 1, course: 'SWE101', className: 'SE1801', time: 'Today 2:00 PM', room: 'Room 301' },
        { id: 2, course: 'DBS202', className: 'DB1801', time: 'Tomorrow 9:00 AM', room: 'Room 205' },
        { id: 3, course: 'WEB301', className: 'WE1801', time: 'Thu 9:00 AM', room: 'Room 402' },
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
                        </div>
                    </div>
                </div>
            </div>

            <div className={`flex pr-0 ${activeSidebarPanel ? 'lg:pr-[380px]' : 'lg:pr-[60px]'}`}>
                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Card View */}
                    {viewMode === 'card' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all"
                                >
                                    {/* Course Header */}
                                    <div className="p-5 border-b border-gray-100">
                                        <div className="mb-3">
                                            <span className="text-xs font-semibold text-[#F37022] bg-orange-50 px-2.5 py-1 rounded">
                                                {course.code}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-[#0A1B3C] text-lg mb-1">
                                            {course.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            {course.totalStudents} students • {course.classes.length} {course.classes.length > 1 ? 'classes' : 'class'}
                                        </p>
                                    </div>

                                    {/* Classes List */}
                                    <div className="divide-y divide-gray-100">
                                        {course.classes.map((cls) => (
                                            <div
                                                key={cls.id}
                                                className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                                onClick={() => navigate('/teacher/classrooms')}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-[#0A1B3C]">{cls.name}</p>
                                                    <p className="text-xs text-gray-500">{cls.students} students • {cls.room}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-[#0A1B3C]">My Courses & Classes</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {courses.map((course) => (
                                    <div key={course.id}>
                                        {/* Course Row */}
                                        <div
                                            className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setExpandedCourse(expandedCourse === course.code ? null : course.code)}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-[#F37022] bg-orange-50 px-2 py-0.5 rounded">{course.code}</span>
                                                    <h3 className="font-medium text-[#0A1B3C]">{course.name}</h3>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {course.classes.length} {course.classes.length > 1 ? 'classes' : 'class'} • {course.totalStudents} students
                                                    {course.pendingGrading > 0 && (
                                                        <span className="ml-2 text-[#F37022]">• {course.pendingGrading} to grade</span>
                                                    )}
                                                </p>
                                            </div>
                                            {expandedCourse === course.code ? (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Expanded Classes */}
                                        {expandedCourse === course.code && (
                                            <div className="bg-gray-50 border-t border-gray-100">
                                                {course.classes.map((cls) => (
                                                    <div
                                                        key={cls.id}
                                                        className="flex items-center px-4 py-3 pl-8 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                        onClick={() => navigate('/teacher/classrooms')}
                                                    >
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-[#0A1B3C]">{cls.name}</p>
                                                            <p className="text-xs text-gray-500">{cls.students} students • {cls.room} • {cls.schedule}</p>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-[#F37022]" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>


                {/* Right Sidebar - Google Calendar Style */}
                <div className="fixed right-0 top-16 bottom-0 hidden lg:block z-10">
                    {/* Icon Bar */}
                    <div className="w-[60px] h-full bg-white flex flex-col items-center py-4 gap-4 shadow-sm">
                        <button
                            onClick={() => setActiveSidebarPanel(activeSidebarPanel === 'grading' ? null : 'grading')}
                            className={`relative p-3 rounded-lg transition-colors ${activeSidebarPanel === 'grading' ? 'bg-orange-100 text-[#F37022]' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            title="Needs Grading"
                        >
                            <AlertCircle className="w-5 h-5" />
                            {todoItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F37022] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {todoItems.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveSidebarPanel(activeSidebarPanel === 'classes' ? null : 'classes')}
                            className={`relative p-3 rounded-lg transition-colors ${activeSidebarPanel === 'classes' ? 'bg-orange-100 text-[#F37022]' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            title="Upcoming Classes"
                        >
                            <Calendar className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F37022] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {upcomingClasses.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveSidebarPanel(activeSidebarPanel === 'stats' ? null : 'stats')}
                            className={`relative p-3 rounded-lg transition-colors ${activeSidebarPanel === 'stats' ? 'bg-orange-100 text-[#F37022]' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            title="This Week"
                        >
                            <FileText className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F37022] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                23
                            </span>
                        </button>
                    </div>

                    {/* Popup Panels */}
                    {activeSidebarPanel && (
                        <div className="absolute right-0 top-0 w-[320px] h-full bg-white border-l border-gray-200 shadow-lg">
                            <div className="p-4 h-full overflow-y-auto">
                                {/* Close Button */}
                                <button
                                    onClick={() => setActiveSidebarPanel(null)}
                                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>

                                {/* Needs Grading Panel */}
                                {activeSidebarPanel === 'grading' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-[#1a1f36] mb-4 pr-8 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-[#F37022]" />
                                            Needs Grading
                                        </h2>
                                        <div className="space-y-3">
                                            {todoItems.map((item) => (
                                                <div key={item.id} className="group cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center flex-shrink-0 text-[#F37022] text-sm font-bold">
                                                            {item.submissions}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-[#1a1f36] truncate">{item.title}</p>
                                                            <p className="text-xs text-gray-500">{item.course}</p>
                                                            <p className="text-xs text-[#F37022]">Due: {item.dueDate}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upcoming Classes Panel */}
                                {activeSidebarPanel === 'classes' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-[#1a1f36] mb-4 pr-8 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            Upcoming Classes
                                        </h2>
                                        <div className="space-y-3">
                                            {upcomingClasses.map((cls) => (
                                                <div key={cls.id} className="p-2 hover:bg-gray-50 rounded-lg -mx-2 cursor-pointer">
                                                    <p className="text-sm font-semibold text-[#1a1f36]">{cls.course} - {cls.className}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {cls.time} • {cls.room}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Stats Panel */}
                                {activeSidebarPanel === 'stats' && (
                                    <div>
                                        <h2 className="text-xl font-bold text-[#1a1f36] mb-4 pr-8">This Week</h2>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-[#F37022]">23</p>
                                                <p className="text-xs text-gray-500">To Grade</p>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-[#0A1B3C]">156</p>
                                                <p className="text-xs text-gray-500">Graded</p>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-[#0A1B3C]">8</p>
                                                <p className="text-xs text-gray-500">Classes</p>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-[#0A1B3C]">247</p>
                                                <p className="text-xs text-gray-500">Students</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherDashboard;
