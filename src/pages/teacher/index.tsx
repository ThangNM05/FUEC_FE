import { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Users, FileText, Calendar, Clock, ArrowRight, AlertCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useGetDefaultSemesterQuery, useGetSemestersQuery } from '@/api/semestersApi';
import { useGetTeachingSubjectsQuery, useGetTeacherScheduleQuery } from '@/api/teachersApi';
import { useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';

function ClassCardItem({ cls, onClick }: { cls: any, onClick: () => void }) {
    const { data: studentsData } = useGetStudentClassesByClassIdQuery(
        { classSubjectId: cls.id, pageSize: 1 },
        { skip: !cls.id }
    );
    const realStudentCount = studentsData?.totalItemCount ?? cls.students;

    return (
        <div
            className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
            onClick={onClick}
        >
            <div>
                <p className="text-sm font-medium text-[#0A1B3C]">{cls.name}</p>
                <p className="text-xs text-gray-500">{realStudentCount} students • {cls.room}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
    );
}

function ClassListItem({ cls, onClick }: { cls: any, onClick: () => void }) {
    const { data: studentsData } = useGetStudentClassesByClassIdQuery(
        { classSubjectId: cls.id, pageSize: 1 },
        { skip: !cls.id }
    );
    const realStudentCount = studentsData?.totalItemCount ?? cls.students;

    return (
        <div
            className="flex items-center px-4 py-3 pl-8 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={onClick}
        >
            <div className="flex-1">
                <p className="text-sm font-medium text-[#0A1B3C]">{cls.name}</p>
                <p className="text-xs text-gray-500">{realStudentCount} students • {cls.room} • {cls.schedule}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#F37022]" />
        </div>
    );
}

interface ClassItem {
    id: string;
    name: string;
    students: number;
    room: string;
    schedule: string;
}

interface CourseItem {
    id: string;
    code: string;
    name: string;
    term: string;
    totalStudents: number;
    pendingGrading: number;
    classes: ClassItem[];
}

function TeacherDashboard() {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
    const [semester, setSemester] = useState('');

    const { data: defaultSemester } = useGetDefaultSemesterQuery();
    const { data: semestersData } = useGetSemestersQuery({ page: 1, pageSize: 100 });
    const semestersList = semestersData?.items || [];

    useEffect(() => {
        if (defaultSemester?.id && !semester) {
            setSemester(defaultSemester.id);
        }
    }, [defaultSemester, semester]);

    const { data: teachingData, isLoading: isTeachingLoading } = useGetTeachingSubjectsQuery(
        { id: user?.entityId || '', semesterId: semester },
        { skip: !user?.entityId || !semester }
    );

    // Courses with multiple classes fetched from API
    const courses: CourseItem[] = teachingData?.subjects?.map((sub: any) => ({
        id: sub.subjectId,
        code: sub.subjectCode,
        name: sub.subjectName,
        term: teachingData.semesterCode,
        totalStudents: sub.totalStudents, // We will calculate this dynamically in the UI
        pendingGrading: 0,
        classes: sub.classes?.map((cls: any) => ({
            id: cls.classSubjectId || cls.classId,
            name: cls.classCode,
            students: cls.studentCount,
        })) || []
    })) || [];

    const { data: scheduleData } = useGetTeacherScheduleQuery(
        {},
        { skip: !user?.entityId }
    );


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
        <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6">
                {/* Title and Semester */}
                <div className="mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Dashboard</h1>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
                        >
                            {semestersList.map((sem) => (
                                <option key={sem.id} value={sem.id}>{sem.semesterCode}</option>
                            ))}
                            {semestersList.length === 0 && defaultSemester && (
                                <option value={defaultSemester.id}>{defaultSemester.semesterCode}</option>
                            )}
                        </select>
                    </div>

                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 mb-6">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search classes, students..."
                        className="flex-1 outline-none text-sm md:text-base text-[#0A1B3C]"
                    />
                </div>

                {/* View Options */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => setViewMode('card')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'card'
                            ? 'bg-[#F37022] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Card View
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list'
                            ? 'bg-[#F37022] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        List View
                    </button>
                </div>

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
                                        <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2.5 py-1 rounded">
                                            {course.code}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-[#0A1B3C] text-lg mb-1">
                                        {course.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {course.classes.length} {course.classes.length > 1 ? 'classes' : 'class'}
                                    </p>
                                </div>

                                {/* Classes List */}
                                <div className="divide-y divide-gray-100">
                                    {course.classes.map((cls) => (
                                        <ClassCardItem
                                            key={cls.id}
                                            cls={cls}
                                            onClick={() => navigate(`/teacher/course-details/${cls.id}`)}
                                        />
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
                                                <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">{course.code}</span>
                                                <h3 className="font-medium text-[#0A1B3C]">{course.name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {course.classes.length} {course.classes.length > 1 ? 'classes' : 'class'}
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
                                                <ClassListItem
                                                    key={cls.id}
                                                    cls={cls}
                                                    onClick={() => navigate(`/teacher/course-details/${cls.id}`)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <div className="w-[300px] border-l border-gray-200 bg-gray-50 p-4 hidden lg:block space-y-3">
                {/* Needs Grading Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h2 className="text-xl font-bold text-[#1a1f36] mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-[#F37022]" />
                        Needs Grading
                    </h2>
                    <div className="space-y-3">
                        <div className="text-sm text-gray-500 text-center py-4">
                            All caught up! No active tasks to grade.
                        </div>
                    </div>
                </div>

                {/* Upcoming Classes Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h2 className="text-xl font-bold text-[#1a1f36] mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        Upcoming Classes
                    </h2>
                    <div className="space-y-3">
                        {scheduleData && scheduleData.length > 0 ? (
                            scheduleData.slice(0, 5).map((slot: any) => (
                                <div key={slot.id} className="p-2 hover:bg-gray-50 rounded-lg -mx-2 cursor-pointer" onClick={() => navigate(`/teacher/course-details/${slot.classSubjectId}`)}>
                                    <p className="text-sm font-semibold text-[#1a1f36]">{slot.subjectCode} - {slot.classCode}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(slot.date).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })} • Room {slot.room || 'TBA'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500 text-center py-4">
                                No upcoming classes scheduled.
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h2 className="text-xl font-bold text-[#1a1f36] mb-4">This Week</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-[#F37022]">{scheduleData?.length || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Classes</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-[#0A1B3C]">{courses.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Courses</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-[#0A1B3C]">{courses.reduce((acc, c) => acc + c.classes.length, 0)}</p>
                            <p className="text-xs text-gray-500 mt-1">Sections</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-[#0A1B3C]">0</p>
                            <p className="text-xs text-gray-500 mt-1">To Grade</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherDashboard;
