import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronRight, Users, FileText, Calendar, BookOpen, ClipboardCheck, Plus } from 'lucide-react';

interface Assignment {
    id: string;
    title: string;
    dueDate: Date;
    maxScore: number;
    submissionCount: number;
    totalStudents: number;
    averageScore?: number;
    status: 'active' | 'closed';
}

function TeacherCourseDetails() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [activeTab, setActiveTab] = useState('assignments');

    // Mock course data
    const course = {
        id: courseId || 'SE1801',
        name: 'Software Engineering',
        code: 'SE1801',
        room: 'Room 301',
        schedule: 'Mon, Wed 8:00 - 10:00',
        totalStudents: 45,
        enrolledStudents: 45,
    };

    // Mock assignments
    const assignments: Assignment[] = [
        {
            id: '1',
            title: 'Lab 1: Introduction to React',
            dueDate: new Date('2025-01-15'),
            maxScore: 100,
            submissionCount: 40,
            totalStudents: 45,
            averageScore: 85,
            status: 'active',
        },
        {
            id: '2',
            title: 'Assignment 2: Database Design',
            dueDate: new Date('2025-01-20'),
            maxScore: 100,
            submissionCount: 35,
            totalStudents: 45,
            status: 'active',
        },
        {
            id: '3',
            title: 'Project Proposal',
            dueDate: new Date('2025-01-10'),
            maxScore: 100,
            submissionCount: 45,
            totalStudents: 45,
            averageScore: 78,
            status: 'closed',
        },
    ];

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';
    };

    const getSubmissionColor = (submitted: number, total: number) => {
        const percentage = (submitted / total) * 100;
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 70) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <button onClick={() => navigate('/teacher')} className="hover:text-[#F37022] transition-colors">
                    Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => navigate('/teacher/classrooms')} className="hover:text-[#F37022] transition-colors">
                    My Classes
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">{course.name}</span>
            </div>

            {/* Course Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">{course.code}</h1>
                            <span className="px-3 py-1 bg-orange-100 text-[#F37022] text-sm font-semibold rounded-full">
                                {course.room}
                            </span>
                        </div>
                        <p className="text-lg text-gray-700 mb-2">{course.name}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {course.schedule}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {course.enrolledStudents} students
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex overflow-x-auto">
                        {[
                            { id: 'assignments', label: 'Assignments', icon: FileText },
                            { id: 'slots', label: 'Slots', icon: Calendar },
                            { id: 'questions', label: 'Question Bank', icon: BookOpen },
                            { id: 'tests', label: 'Progress Tests', icon: ClipboardCheck },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-[#F37022] text-[#F37022]'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'assignments' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#0A1B3C]">Course Assignments</h2>
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#F37022] text-white rounded-lg hover:bg-[#D96419] transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Create Assignment
                                </button>
                            </div>

                            <div className="space-y-4">
                                {assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors bg-white"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-[#0A1B3C]">{assignment.title}</h3>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        Due: {assignment.dueDate.toLocaleDateString()}
                                                    </span>
                                                    <span className={`font-medium ${getSubmissionColor(assignment.submissionCount, assignment.totalStudents)}`}>
                                                        {assignment.submissionCount}/{assignment.totalStudents} submitted
                                                    </span>
                                                    {assignment.averageScore && (
                                                        <span className="text-gray-700 font-medium">Avg: {assignment.averageScore}/100</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/teacher/assignment/${assignment.id}/submissions`)}
                                                    className="px-4 py-2 bg-[#F37022] text-white rounded-lg hover:bg-[#D96419] transition-colors text-sm font-medium"
                                                >
                                                    View Submissions
                                                </button>
                                                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'slots' && (
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="font-medium">Slots management coming soon</p>
                        </div>
                    )}

                    {activeTab === 'questions' && (
                        <div className="text-center py-12 text-gray-500">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="font-medium">Questions management coming soon</p>
                        </div>
                    )}

                    {activeTab === 'tests' && (
                        <div className="text-center py-12 text-gray-500">
                            <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="font-medium">Progress tests management coming soon</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeacherCourseDetails;
