import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
    ChevronRight, Users, FileText, Calendar, ClipboardCheck, Plus,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { useGetClassSubjectByIdQuery, useGetClassSubjectSlotsQuery } from '@/api/classDetailsApi';
import { useGetExamsByClassSubjectIdQuery, useDeleteExamMutation } from '@/api/examsApi';
import ExamDetailModal from '@/components/modals/ExamDetailModal';
import EditExamModal from '@/components/modals/EditExamModal';
import type { Exam } from '@/types/exam.types';
import { Modal } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';

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
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    topics: string[];
    questions: Question[];
    assignments: SlotAssignment[];
    expanded: boolean;
}

function TeacherCourseDetails() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [activeTab, setActiveTab] = useState('slots');
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [isExamDetailModalOpen, setIsExamDetailModalOpen] = useState(false);
    const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
    const [examToEdit, setExamToEdit] = useState<Exam | null>(null);

    const [deleteExam] = useDeleteExamMutation();

    // Pagination for slots
    const [currentPage, setCurrentPage] = useState(1);
    const SLOTS_PER_PAGE = 10;

    const { data: classSubject, isLoading } = useGetClassSubjectByIdQuery(courseId || '', {
        skip: !courseId,
    });

    const { data: examsData, isLoading: isLoadingExams } = useGetExamsByClassSubjectIdQuery(courseId || '', {
        skip: !courseId,
    });
    const exams = examsData?.items || [];

    // Mock course data combined with real DB data if available
    const course = {
        id: courseId || 'SE1801',
        name: classSubject?.subjectName || 'Loading...',
        code: classSubject ? `${classSubject.subjectCode} - ${classSubject.classCode}` : 'SE1801',
        room: 'TBA',
        schedule: 'TBA',
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

    // Removed mock slot status generation since teacher slots do not need time-based color coding

    const { data: slotData, isLoading: isLoadingSlots } = useGetClassSubjectSlotsQuery(courseId || '', {
        skip: !courseId,
    });

    const [slots, setSlots] = useState<Slot[]>([]);

    useEffect(() => {
        if (slotData && slotData.slots) {
            setSlots(slotData.slots.map((s: any, i: number) => ({
                id: s.id,
                title: `Slot ${s.slotIndex}`,
                startTime: new Date(s.date).toLocaleString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }),
                endTime: new Date(s.endDate).toLocaleString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }),
                topics: s.sessions?.map((session: any) => session.topic) || [],
                questions: [], // mock for now
                assignments: [], // mock for now
                expanded: i === 0
            })));
        }
    }, [slotData]);

    const toggleSlot = (slotId: string) => {
        setSlots(slots.map(slot =>
            slot.id === slotId ? { ...slot, expanded: !slot.expanded } : slot
        ));
    };

    const handleDeleteExam = (e: React.MouseEvent, exam: Exam) => {
        e.stopPropagation();
        Modal.confirm({
            title: 'Delete Exam',
            content: `Are you sure you want to delete "${exam.category}${exam.displayName ? ` - ${exam.displayName}` : ''}"?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteExam(exam.id).unwrap();
                    toast.success('Exam deleted successfully');
                } catch (error) {
                    toast.error('Failed to delete exam');
                }
            },
        });
    };

    const handleEditExam = (e: React.MouseEvent, exam: Exam) => {
        e.stopPropagation();
        setExamToEdit(exam);
        setIsEditExamModalOpen(true);
    };

    if (isLoading || isLoadingSlots) {
        return <div className="p-6 text-center animate-pulse">Loading course data...</div>;
    }

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
                            {/* <span className="px-3 py-1 bg-orange-100 text-[#F37022] text-sm font-semibold rounded-full">
                                {course.room}
                            </span> */}
                        </div>
                        <p className="text-lg text-gray-700 mb-2">{course.name}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            {/* <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {course.schedule}
                            </span> */}
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
                                        <div key={slot.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                            {/* Slot Header */}
                                            <div className="p-4 bg-gray-50 border-b border-gray-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                            {slot.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* Edit button for teachers */}
                                                        <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors text-xs font-medium">
                                                            Edit Slot
                                                        </button>
                                                        <button
                                                            onClick={() => toggleSlot(slot.id)}
                                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
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
                        <div className="animate-fadeIn">
                            {isLoadingExams ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F37022] mx-auto mb-4"></div>
                                    <p className="font-medium animate-pulse">Loading tests...</p>
                                </div>
                            ) : exams.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                                    <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="font-medium text-lg text-gray-500">No tests available</p>
                                    <p className="text-sm text-gray-400 mt-1">Create a new test to get started</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {exams.map((exam) => (
                                        <div
                                            key={exam.id}
                                            className="border border-gray-200 rounded-xl p-5 hover:border-[#F37022] hover:shadow-md transition-all bg-white relative overflow-hidden group cursor-pointer"
                                            onClick={() => {
                                                setSelectedExam(exam);
                                                setIsExamDetailModalOpen(true);
                                            }}
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#F37022]"></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#0A1B3C] group-hover:text-[#F37022] transition-colors leading-tight">
                                                        {exam.category} {exam.displayName ? ` - ${exam.displayName}` : ''}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-1">{exam.syllabusName}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 whitespace-nowrap ml-4 shrink-0">
                                                    Wt: {exam.weight}%
                                                </span>
                                            </div>

                                            <div className="space-y-2 mt-5">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 p-2 rounded-lg border border-gray-100">
                                                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <span className="font-medium">Starts:</span>
                                                    <span className="text-gray-900">{new Date(exam.startTime).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/80 p-2 rounded-lg border border-gray-100">
                                                    <ClipboardCheck className="w-4 h-4 text-gray-400 shrink-0" />
                                                    <span className="font-medium">Ends:</span>
                                                    <span className="text-gray-900">{new Date(exam.endTime).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2.5 py-1.5 text-xs font-medium rounded-lg ${exam.securityMode === 2 ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                        {exam.securityMode === 2 ? `Dynamic Code (${exam.codeDuration || 60}s)` : 'Static Code'}
                                                    </span>
                                                    {exam.requireIpCheck && (
                                                        <span className="px-2.5 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 text-xs font-medium rounded-lg flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                                            IP Checked
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleEditExam(e, exam)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Exam"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteExam(e, exam)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Exam"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ExamDetailModal
                exam={selectedExam}
                isOpen={isExamDetailModalOpen}
                onClose={() => setIsExamDetailModalOpen(false)}
            />

            <EditExamModal
                exam={examToEdit}
                isOpen={isEditExamModalOpen}
                onClose={() => setIsEditExamModalOpen(false)}
            />
        </div>
    );
}

export default TeacherCourseDetails;
