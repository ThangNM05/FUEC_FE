import { useEffect, useState } from 'react';
import { Select } from 'antd';
import { ChevronRight, ChevronDown, Users, FileText, Calendar, Clock, ArrowRight, AlertCircle, Search, Book } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useGetDefaultSemesterQuery, useGetSemestersQuery } from '@/api/semestersApi';
import { useGetTeachingSubjectsQuery, useGetTeacherScheduleQuery, useGetTeacherDashboardQuery } from '@/api/teachersApi';
import { useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Progress, List, Card, Badge, Empty } from 'antd';

function ClassCardItem({ cls, onClick }: { cls: any, onClick: () => void }) {
    const { data: studentsData } = useGetStudentClassesByClassIdQuery(
        { classSubjectId: cls.id, pageSize: 1 },
        { skip: !cls.id }
    );
    const realStudentCount = studentsData?.totalItemCount ?? 0;
    const isLoading = !studentsData;

    return (
        <div
            className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
            onClick={onClick}
        >
            <div>
                <p className="text-sm font-medium text-[#0A1B3C]">{cls.name}</p>
                <p className="text-xs text-gray-500">
                    {isLoading ? 'Loading students...' : `${realStudentCount} students`} • {cls.room}
                </p>
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
    const realStudentCount = studentsData?.totalItemCount ?? 0;
    const isLoading = !studentsData;

    return (
        <div
            className="flex items-center px-4 py-3 pl-8 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={onClick}
        >
            <div className="flex-1">
                <p className="text-sm font-medium text-[#0A1B3C]">{cls.name}</p>
                <p className="text-xs text-gray-500">
                    {isLoading ? 'Loading students...' : `${realStudentCount} students`} • {cls.room} • {cls.schedule}
                </p>
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

function SubjectStudentCount({ classes }: { classes: any[] }) {
    let total = 0;
    let loading = false;
    return <span>{classes.length} {classes.length > 1 ? 'classes' : 'class'}</span>;
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


    const { data: dashboardData, isLoading: isDashboardLoading } = useGetTeacherDashboardQuery(
        { semesterId: semester },
        { skip: !semester }
    );

    const stats = dashboardData ? [
        { label: 'Active Classes', value: dashboardData.activeClassesCount, icon: Book, color: 'blue' },
        { label: 'Active Subjects', value: dashboardData.activeSubjectsCount, icon: FileText, color: 'purple' },
        { label: 'Total Students', value: dashboardData.totalStudentsCount, icon: Users, color: 'orange' },
        { label: 'To Grade', value: dashboardData.assignmentsToGradeCount, icon: AlertCircle, color: 'red' }
    ] : [];

    const COLORS = ['#F37022', '#0A1B3C', '#0066b3', '#ff8a33', '#1a1f36'];
    return (
        <div className="flex">
            <div className="flex-1 p-4 md:p-6">
                <div className="mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Dashboard</h1>
                        <Select
                            value={semester}
                            onChange={(value) => setSemester(value)}
                            className="w-40"
                            placeholder="Select semester"
                            options={[
                                ...semestersList.map((sem) => ({
                                    label: sem.semesterCode,
                                    value: sem.id,
                                })),
                                ...(semestersList.length === 0 && defaultSemester ? [{
                                    label: defaultSemester.semesterCode,
                                    value: defaultSemester.id,
                                }] : [])
                            ]}
                        />
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {isDashboardLoading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse h-32" />
                        ))
                    ) : (
                        stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all relative overflow-hidden group">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="text-3xl font-bold text-[#0A1B3C]">{stat.value}</div>
                                            <div className="text-sm text-gray-500 mt-1 font-semibold uppercase tracking-wider">{stat.label}</div>
                                        </div>
                                        <div className={`p-3 rounded-lg flex items-center justify-center bg-gray-50 text-[#F37022] group-hover:bg-[#F37022] group-hover:text-white transition-colors`}>
                                            <Icon className={`w-6 h-6`} />
                                        </div>
                                    </div>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#F37022]"></div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Progress Charts Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Class Progress Bar Chart */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#0A1B3C]">Class Progress Overview</h2>
                                <p className="text-sm text-gray-500">Subject Coverage</p>
                            </div>
                            <div className="h-[300px] w-full">
                                {dashboardData && dashboardData.classProgress.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dashboardData.classProgress} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="classCode"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#0A1B3C', fontSize: 12, fontWeight: 'bold' }}
                                                width={80}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f9fafb' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                                                                <p className="text-sm font-bold text-[#0A1B3C]">{data.classCode} - {data.subjectCode}</p>
                                                                <p className="text-xs text-gray-500">Progress: {data.progressPercentage}%</p>
                                                                <p className="text-xs text-gray-500">Slots: {data.completedSlots}/{data.totalSlots}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="progressPercentage" radius={[0, 4, 4, 0]} barSize={25}>
                                                {dashboardData.classProgress.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <Empty description="No progress data available" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary View of Class Detail Progression */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <h2 className="text-xl font-bold text-[#0A1B3C] mb-6 border-b pb-2">Detailed Class Progression</h2>
                            <div className="space-y-6">
                                {dashboardData?.classProgress.map((cp) => (
                                    <div key={cp.classSubjectId} className="group cursor-pointer" onClick={() => navigate(`/teacher/course-details/${cp.classSubjectId}`)}>
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <span className="text-xs font-bold text-[#F37022] uppercase tracking-wider">{cp.subjectCode}</span>
                                                <h3 className="text-base font-bold text-[#0A1B3C] group-hover:text-[#F37022] transition-colors">{cp.classCode}</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-[#0A1B3C]">{cp.progressPercentage}%</span>
                                                <p className="text-[10px] text-gray-500 uppercase">{cp.completedSlots}/{cp.totalSlots} Slots</p>
                                            </div>
                                        </div>
                                        <Progress
                                            percent={cp.progressPercentage}
                                            strokeColor={{
                                                '0%': '#F37022',
                                                '100%': '#0A1B3C',
                                            }}
                                            showInfo={false}
                                            strokeWidth={8}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Today's Schedule Card */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-[#0A1B3C] p-4 text-white">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-400" />
                                    Today's Schedule
                                </h2>
                            </div>
                            <div className="p-4">
                                {dashboardData && dashboardData.todaySchedule.length > 0 ? (
                                    <div className="space-y-4">
                                        {dashboardData.todaySchedule.map((item: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer group" onClick={() => navigate(`/teacher/course-details/${item.classSubjectId || item.id}`)}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-[#F37022]">{item.subjectCode}</span>
                                                    <span className="text-[10px] font-bold bg-[#0A1B3C] text-white px-2 py-0.5 rounded uppercase">{item.room || 'TBA'}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-[#0A1B3C] group-hover:text-[#F37022] transition-colors">{item.classCode}</h4>
                                                <div className="flex items-center gap-1 mt-1 text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-medium">{item.startTime} - {item.endTime}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center bg-gray-50 rounded-lg">
                                        <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No classes scheduled for today.</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => navigate('/teacher/classrooms')}
                                    className="w-full mt-4 py-2 text-sm font-bold text-[#0A1B3C] hover:text-[#F37022] transition-colors flex items-center justify-center gap-1"
                                >
                                    View Full Schedule <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Assignments to Grade */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <h2 className="text-xl font-bold text-[#0A1B3C] mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#F37022]" />
                                Tasks to Grade
                            </h2>
                            {dashboardData?.assignmentsToGradeCount && dashboardData.assignmentsToGradeCount > 0 ? (
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-[#F37022]">{dashboardData.assignmentsToGradeCount}</p>
                                        <p className="text-xs text-orange-700 font-medium">Pending submissions</p>
                                    </div>
                                    <button className="bg-[#F37022] text-white p-2 rounded-lg" onClick={() => navigate('/teacher/classrooms')}>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="All grading completed!" />
                            )}
                        </div>

                        {/* Recent Notifications */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <h2 className="text-xl font-bold text-[#0A1B3C] mb-4">Recent Notices</h2>
                            {dashboardData && dashboardData.recentNotifications.length > 0 ? (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={dashboardData.recentNotifications}
                                    renderItem={(item: any) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Badge dot color="orange" />}
                                                title={<span className="text-sm font-semibold text-[#0A1B3C]">{item.title}</span>}
                                                description={<span className="text-xs text-gray-500">{item.time}</span>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4 italic">No new notifications</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 mt-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-[#0A1B3C]">Course Management</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('card')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'card' ? 'bg-[#F37022] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Card View
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-[#F37022] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                List View
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 mb-6">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search classes, students..."
                            className="flex-1 outline-none text-sm md:text-base text-[#0A1B3C]"
                        />
                    </div>

                    {viewMode === 'card' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {courses.map((course) => (
                                <div key={course.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all">
                                    <div className="p-5 border-b border-gray-100">
                                        <div className="mb-3">
                                            <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2.5 py-1 rounded">{course.code}</span>
                                        </div>
                                        <h3 className="font-bold text-[#0A1B3C] text-lg mb-1">{course.name}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            <SubjectStudentCount classes={course.classes} />
                                        </p>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {course.classes.map((cls) => (
                                            <ClassCardItem key={cls.id} cls={cls} onClick={() => navigate(`/teacher/course-details/${cls.id}`)} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {viewMode === 'list' && (
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-[#0A1B3C]">My Courses & Classes</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {courses.map((course) => (
                                    <div key={course.id}>
                                        <div className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedCourse(expandedCourse === course.code ? null : course.code)}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">{course.code}</span>
                                                    <h3 className="font-medium text-[#0A1B3C]">{course.name}</h3>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {course.classes.length} {course.classes.length > 1 ? 'classes' : 'class'}
                                                    {course.pendingGrading > 0 && <span className="ml-2 text-[#F37022]">• {course.pendingGrading} to grade</span>}
                                                </p>
                                            </div>
                                            {expandedCourse === course.code ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                                        </div>
                                        {expandedCourse === course.code && (
                                            <div className="bg-gray-50 border-t border-gray-100">
                                                {course.classes.map((cls) => (
                                                    <ClassListItem key={cls.id} cls={cls} onClick={() => navigate(`/teacher/course-details/${cls.id}`)} />
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
        </div>
    );
}

export default TeacherDashboard;
