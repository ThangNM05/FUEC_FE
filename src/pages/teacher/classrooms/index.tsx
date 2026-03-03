import { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Users, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useGetDefaultSemesterQuery, useGetSemestersQuery } from '@/api/semestersApi';
import { useGetTeachingSubjectsQuery } from '@/api/teachersApi';

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

function TeacherClassrooms() {
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
        totalStudents: sub.totalStudents,
        pendingGrading: 0,
        classes: sub.classes?.map((cls: any) => ({
            id: cls.classSubjectId || cls.classId,
            name: cls.classCode,
            students: cls.studentCount,
            room: 'TBA', // or maybe from API if available
            schedule: 'TBA',
        })) || []
    })) || [];


    return (
        <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6">
                {/* Title and Semester */}
                <div className="mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">My Classes</h1>
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
                        placeholder="Search classes..."
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
                                        {course.totalStudents} students • {course.classes.length} {course.classes.length > 1 ? 'classes' : 'class'}
                                    </p>
                                </div>

                                {/* Classes List */}
                                <div className="divide-y divide-gray-100">
                                    {course.classes.map((cls) => (
                                        <div
                                            key={cls.id}
                                            className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                                            onClick={() => navigate(`/teacher/course-details/${cls.id}`)}
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
                                                <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">{course.code}</span>
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
                                                    onClick={() => navigate(`/teacher/course-details/${cls.id}`)}
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
        </div>
    );
}

export default TeacherClassrooms;

