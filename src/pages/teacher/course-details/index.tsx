import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
    ChevronRight, Users, FileText, Calendar, ClipboardCheck, Plus,
    ChevronDown, ChevronUp, Lock, CheckCircle, Clock
} from 'lucide-react';

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

interface Question {
    id: number;
    title: string;
    status: 'custom' | 'finished';
}

interface SlotAssignment {
    id: number;
    title: string;
}

interface Slot {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    topics: string[];
    questions: Question[];
    assignments: SlotAssignment[];
    expanded: boolean;
    status: 'locked' | 'completed' | 'pending' | 'urgent' | 'overdue';
    remaining?: string;
}

function TeacherCourseDetails() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [activeTab, setActiveTab] = useState('slots');

    // Pagination for slots
    const [currentPage, setCurrentPage] = useState(1);
    const SLOTS_PER_PAGE = 10;

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

    // Generate 20 slots with realistic data and status
    const getSlotStatus = (slotId: number): 'locked' | 'completed' | 'pending' | 'urgent' | 'overdue' => {
        if (slotId <= 5) return 'completed';
        if (slotId === 6) return 'overdue';
        if (slotId <= 8) return 'urgent';
        if (slotId <= 10) return 'pending';
        return 'locked';
    };

    const getRemaining = (slotId: number): string | undefined => {
        if (slotId === 6) return 'Overdue 2 days';
        if (slotId === 7) return '23 hours';
        if (slotId === 8) return '4 hours 30 min';
        if (slotId === 9) return '2 days';
        if (slotId === 10) return '5 days';
        return undefined;
    };

    const [slots, setSlots] = useState<Slot[]>(
        Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `Slot ${i + 1}`,
            startTime: '12:30 10/09/2025',
            endTime: '14:45 10/09/2025',
            topics: i === 0
                ? ['Mobile Development Overview', 'Android Introduction', 'Android Studio', 'Android Application Structure']
                : [`Topic ${i * 3 + 1}`, `Topic ${i * 3 + 2}`, `Topic ${i * 3 + 3}`],
            questions: [
                { id: 1, title: 'What is android?', status: 'finished' as const },
                { id: 2, title: 'What is Android Structure?', status: 'finished' as const },
                { id: 3, title: 'Explain android activity life cycle?', status: 'custom' as const }
            ],
            assignments: [
                { id: 1, title: 'Submit Demo Hello World!' }
            ],
            expanded: false,
            status: getSlotStatus(i + 1),
            remaining: getRemaining(i + 1)
        }))
    );

    const toggleSlot = (slotId: number) => {
        setSlots(slots.map(slot =>
            slot.id === slotId ? { ...slot, expanded: !slot.expanded } : slot
        ));
    };

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb ... */}
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

            {/* Course Header ... */}
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
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/teacher/create-exam?course=${courseId}`)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#F37022] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#d95f19] transition-all active:scale-95 shadow-md shadow-orange-200"
                        >
                            <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Create Exam</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs ... */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex overflow-x-auto">
                        {[
                            { id: 'slots', label: 'Slots', icon: Calendar },
                            { id: 'assignments', label: 'Assignments', icon: FileText },
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

                {/* Tab Content ... */}
                <div className="p-6">
                    {activeTab === 'slots' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-[#0A1B3C]">Course Slots</h2>
                                <div className="text-sm text-gray-500">
                                    Page {currentPage} of {Math.ceil(slots.length / SLOTS_PER_PAGE)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {slots
                                    .slice((currentPage - 1) * SLOTS_PER_PAGE, currentPage * SLOTS_PER_PAGE)
                                    .map(slot => (
                                        <div key={slot.id} className={`border rounded-lg overflow-hidden ${slot.status === 'locked' ? 'border-gray-300 opacity-60' :
                                            slot.status === 'overdue' ? 'border-red-400' :
                                                slot.status === 'urgent' ? 'border-orange-300' :
                                                    slot.status === 'completed' ? 'border-green-300' :
                                                        'border-gray-200'
                                            }`}>
                                            {/* Slot Header */}
                                            <div className={`p-4 ${slot.status === 'locked' ? 'bg-gray-100' :
                                                slot.status === 'overdue' ? 'bg-red-50' :
                                                    slot.status === 'urgent' ? 'bg-orange-50' :
                                                        slot.status === 'completed' ? 'bg-green-50' :
                                                            'bg-gray-50'
                                                }`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${slot.status === 'locked' ? 'bg-gray-200 text-gray-500' :
                                                            slot.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                                slot.status === 'urgent' ? 'bg-orange-100 text-orange-700' :
                                                                    slot.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {slot.title}
                                                        </span>
                                                        {slot.status === 'locked' && (
                                                            <Lock className="w-4 h-4 text-gray-400" />
                                                        )}
                                                        {slot.status === 'completed' && (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        )}
                                                        {slot.status === 'urgent' && (
                                                            <>
                                                                <Clock className="w-4 h-4 text-orange-500" />
                                                                {slot.remaining && (
                                                                    <span className="text-xs text-orange-600 font-medium">{slot.remaining} left</span>
                                                                )}
                                                            </>
                                                        )}
                                                        {slot.status === 'pending' && slot.remaining && (
                                                            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                                {slot.remaining} left
                                                            </span>
                                                        )}
                                                        {slot.status === 'overdue' && (
                                                            <span className="text-xs text-red-600 font-bold uppercase border border-red-200 bg-red-50 px-2 py-0.5 rounded">
                                                                OVERDUE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* Edit button for teachers */}
                                                        <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                                                            Edit Slot
                                                        </button>
                                                        <button
                                                            onClick={() => toggleSlot(slot.id)}
                                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                            disabled={slot.status === 'locked'}
                                                        >
                                                            {slot.expanded ? (
                                                                <ChevronUp className="w-5 h-5 text-gray-600" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5 text-gray-600" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{slot.startTime} - {slot.endTime}</span>
                                                </div>

                                                <div className="space-y-1">
                                                    {slot.topics.map((topic, index) => (
                                                        <div key={index} className="text-sm font-medium text-[#0A1B3C]">
                                                            {topic}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Slot Content (Expandable) */}
                                            {slot.expanded && (
                                                <div className="p-4 bg-white">
                                                    {/* Questions Section */}
                                                    <div className="mb-6 flex flex-col">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="text-xs font-semibold text-gray-500 uppercase">QUESTIONS</h4>
                                                            <button className="text-xs font-medium text-[#F37022] hover:text-[#D96419] flex items-center gap-1">
                                                                <Plus className="w-3 h-3" /> Add Question
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {slot.questions.map(question => (
                                                                <div
                                                                    key={question.id}
                                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 hover:border-[#F37022] border border-transparent transition-all cursor-pointer group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                                                            <FileText className="w-4 h-4 text-orange-600" />
                                                                        </div>
                                                                        <span className="text-sm text-[#0A1B3C] group-hover:text-[#F37022] font-medium transition-colors">{question.title}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`px-3 py-1 text-xs font-semibold rounded ${question.status === 'custom'
                                                                            ? 'bg-orange-100 text-orange-700'
                                                                            : 'bg-green-100 text-green-700'
                                                                            }`}>
                                                                            {question.status === 'custom' ? 'Custom' : 'Finished'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Assignments Section */}
                                                    {slot.assignments.length > 0 && (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="text-xs font-semibold text-gray-500 uppercase">ASSIGNMENTS</h4>
                                                                <button className="text-xs font-medium text-[#F37022] hover:text-[#D96419] flex items-center gap-1">
                                                                    <Plus className="w-3 h-3" /> Add Assignment
                                                                </button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {slot.assignments.map(assignment => (
                                                                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                                                                <FileText className="w-4 h-4 text-pink-600" />
                                                                            </div>
                                                                            <span className="text-sm text-[#0A1B3C]">{assignment.title}</span>
                                                                        </div>
                                                                        <span className="text-sm text-gray-500">N/A</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.ceil(slots.length / SLOTS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                ? 'bg-[#F37022] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(slots.length / SLOTS_PER_PAGE), prev + 1))}
                                    disabled={currentPage === Math.ceil(slots.length / SLOTS_PER_PAGE)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div className="animate-fadeIn">
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

                    {activeTab === 'tests' && (
                        <div className="text-center py-12 text-gray-500 animate-fadeIn">
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
