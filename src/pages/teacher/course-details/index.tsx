import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
    ChevronRight, Users, FileText, Calendar, ClipboardCheck, Plus,
    ChevronDown, ChevronUp, Clock, Loader2, Pencil, Trash2
} from 'lucide-react';
import {
    useGetClassSubjectByIdQuery, 
    useGetClassSubjectSlotsQuery,
    useGetStudentClassesQuery
} from '@/api/classDetailsApi';
import { useGetExamsByClassSubjectIdQuery, useDeleteExamMutation } from '@/api/examsApi';
import { useGetAssignmentsByClassSubjectIdQuery } from '@/api/assignmentsApi';
import ExamDetailModal from '@/components/modals/ExamDetailModal';
import EditExamModal from '@/components/modals/EditExamModal';
import CreateAssignmentModal from '@/components/modals/CreateAssignmentModal';
import type { Exam } from '@/types/exam.types';
import type { Assignment } from '@/types/assignment.types';
import { Modal } from 'antd';

interface Question {
    id: number;
    title: string;
    status: 'custom' | 'finished';
}

type SlotAssignment = Assignment;

interface Slot {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    topics: string[];
    questions: Question[];
    assignments: SlotAssignment[];
    expanded: boolean;
    isAssessment: boolean;
    slotIndex: number;
}

function TeacherCourseDetails() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [activeTab, setActiveTab] = useState('slots');
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [isExamDetailModalOpen, setIsExamDetailModalOpen] = useState(false);
    const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
    const [examToEdit, setExamToEdit] = useState<Exam | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
    const [isStudentListModalOpen, setIsStudentListModalOpen] = useState(false);
    const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
    const [createAssignmentSlotInfo, setCreateAssignmentSlotInfo] = useState<{ id: string; title: string; slotIndex: number } | null>(null);

    const [deleteExam] = useDeleteExamMutation();

    const handleOpenCreateAssignment = (slotInfo: any) => {
        setCreateAssignmentSlotInfo(slotInfo);
        setIsCreateAssignmentModalOpen(true);
    };

    const handleDeleteAssignment = (e: React.MouseEvent, assignment: any) => {
        e.stopPropagation();
        Modal.confirm({
            title: 'Delete Assignment',
            content: `Are you sure you want to delete ${assignment.displayName || assignment.title}?`,
            onOk: () => {
                toast.success('Mock delete successful');
            }
        });
    }


    // Pagination for slots
    const [currentPage, setCurrentPage] = useState(1);
    const SLOTS_PER_PAGE = 10;

    // Scroll to top when page changes
    useEffect(() => {
        const scrollContainer = document.querySelector('.overflow-y-auto');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage, activeTab]);

    const { data: classSubject, isLoading } = useGetClassSubjectByIdQuery(courseId || '', {
        skip: !courseId,
    });

    const { data: examsData, isLoading: isLoadingExams } = useGetExamsByClassSubjectIdQuery(courseId || '', {
        skip: !courseId,
    });

    const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentClassesQuery(
        { classId: classSubject?.classId || '', pageSize: 200 },
        { skip: !classSubject?.classId }
    );

    const { data: assignmentsData, isLoading: isLoadingAssignments } = useGetAssignmentsByClassSubjectIdQuery(
        classSubject?.id || '',
        { skip: !classSubject?.id }
    );

    const exams = useMemo(() => {
        if (!examsData?.items) return [];
        return [...examsData.items].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [examsData]);

    // Mock course data combined with real DB data if available
    const course = {
        id: courseId || 'SE1801',
        name: classSubject?.subjectName || 'Loading...',
        code: classSubject ? `${classSubject.subjectCode} - ${classSubject.classCode}` : 'SE1801',
        room: 'TBA',
        schedule: 'TBA',
        totalStudents: studentsData?.totalItemCount || 0,
        enrolledStudents: studentsData?.totalItemCount || 0,
    };

    const assignments = useMemo(() => {
        return assignmentsData?.items || [];
    }, [assignmentsData]);

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
                assignments: (() => {
                    // Extract assignment numbers from session topics (e.g., "Assignment 01" → 1)
                    const asmNumbers: number[] = [];
                    s.sessions?.forEach((session: any) => {
                        const match = session.topic?.match(/\bAssignment\s*(\d+)\b/i);
                        if (match) asmNumbers.push(parseInt(match[1]));
                    });
                    return (assignmentsData?.items || [])
                        .filter((a: any) => asmNumbers.includes(a.instanceNumber))
                        .map((a: any) => ({
                            ...a,
                            fileUrl: a.fileUrl || a.filePaths?.[0] || ''
                        }));
                })(),
                expanded: i === 0,
                isAssessment: s.sessions?.some((sess: any) =>
                    sess.isAssessment ||
                    /\b(Progress Test|PT|Examination|Final Exam|Exam|Quiz|Test)\b/i.test(sess.topic)
                ) || false,
                slotIndex: s.slotIndex
            })));
        }
    }, [slotData, assignmentsData]);

    const formatStudentCode = (code?: string) => {
        if (!code) return '';
        const match = code.match(/[a-zA-Z]{2}\d{6}$/);
        return match ? match[0].toUpperCase() : code;
    };

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
        <div className="p-4 md:p-6 pb-24 md:pb-32 animate-fadeIn">
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
                            <span 
                                className="flex items-center gap-1 cursor-pointer hover:text-[#F37022] hover:underline"
                                onClick={() => setIsStudentListModalOpen(true)}
                            >
                                <Users className="w-4 h-4" />
                                <span className="text-[#F37022] bg-orange-100 px-1 rounded">{course.enrolledStudents} students</span>
                            </span>
                        </div>
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
                                                        {/* Actions for teachers */}



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
                                                    {/* Slot Content Sections */}
                                                    <div>
                                                        {/* Top Actions: Create Content Dropdown */}
                                                        <div className="flex justify-end mb-4">
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenDropdownId(openDropdownId === `${slot.id}-content` ? null : `${slot.id}-content`);
                                                                    }}
                                                                    className="text-xs font-semibold text-[#F37022] hover:text-[#D96419] flex items-center gap-1 transition-colors px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-100"
                                                                >
                                                                    <Plus className="w-3 h-3" /> Create content
                                                                </button>

                                                                {openDropdownId === `${slot.id}-content` && (
                                                                    <>
                                                                        <div
                                                                            className="fixed inset-0 z-40"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setOpenDropdownId(null);
                                                                            }}
                                                                        />
                                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenDropdownId(null);
                                                                                    // Navigate to create question
                                                                                }}
                                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                            >
                                                                                <FileText className="w-4 h-4 text-gray-400" />
                                                                                Create Question
                                                                            </button>

                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenDropdownId(null);
                                                                                    navigate(`/teacher/create-exam?course=${courseId}&slot=${slot.id}`);
                                                                                }}
                                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50"
                                                                            >
                                                                                <FileText className="w-4 h-4 text-gray-400" />
                                                                                Create Progress Test
                                                                            </button>

                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenDropdownId(null);
                                                                                    handleOpenCreateAssignment({
                                                                                        id: slot.id,
                                                                                        title: slot.title,
                                                                                        slotIndex: slot.slotIndex,
                                                                                    });
                                                                                }}
                                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50"
                                                                            >
                                                                                <FileText className="w-4 h-4 text-gray-400" />
                                                                                Create Assignment
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isLoadingExams || isLoadingAssignments ? (
                                                            <div className="py-4 flex items-center justify-center gap-2 text-gray-400">
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span className="text-sm">Loading content...</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {/* QUESTION Section */}
                                                                {slot.questions.length > 0 && (
                                                                    <div className="mb-6">
                                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-gray-100">
                                                                            QUESTION
                                                                        </h4>
                                                                        <div className="space-y-1">
                                                                            {slot.questions.map(question => (
                                                                                <div key={question.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group transition-colors">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 text-orange-500">
                                                                                            <FileText className="w-4 h-4" />
                                                                                        </div>
                                                                                        <span className="text-sm font-medium text-gray-800">{question.title}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4">
                                                                                        <span className="text-xs font-bold text-red-500">Custom</span>
                                                                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded">Cancelled</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* PROGRESS TEST Section */}
                                                                {(() => {
                                                                    const ptNumbers: number[] = [];
                                                                    slot.topics.forEach(topic => {
                                                                        const match = topic.match(/\b(?:Progress Test|PT)\s*(\d+)\b/i);
                                                                        if (match) ptNumbers.push(parseInt(match[1]));
                                                                    });
                                                                    const slotExams = exams.filter(e => ptNumbers.includes(e.instanceNumber));
                                                                    return slotExams.length > 0 ? (
                                                                    <div className="mb-6">
                                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-gray-100">
                                                                            PROGRESS TEST
                                                                        </h4>
                                                                        <div className="space-y-1">
                                                                            {slotExams.map(exam => (
                                                                                <div
                                                                                    key={exam.id}
                                                                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group transition-colors cursor-pointer"
                                                                                    onClick={() => {
                                                                                        setSelectedExam(exam);
                                                                                        setIsExamDetailModalOpen(true);
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                                            <FileText className="w-4 h-4 text-blue-700" />
                                                                                        </div>
                                                                                        <div className="min-w-0">
                                                                                            <p className="text-sm font-medium text-gray-800">
                                                                                                {exam.displayName || (exam.category ? `${exam.category} ${exam.instanceNumber}` : `Progress Test ${exam.instanceNumber}`)}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                                                                        <button
                                                                                            onClick={(e) => handleEditExam(e, exam)}
                                                                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                                            title="Edit Exam"
                                                                                        >
                                                                                            <Pencil className="w-4 h-4" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={(e) => handleDeleteExam(e, exam)}
                                                                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                                            title="Delete Exam"
                                                                                        >
                                                                                            <Trash2 className="w-4 h-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    ) : null;
                                                                })()}

                                                                {/* ASSIGNMENT Section */}
                                                                {slot.assignments.length > 0 && (
                                                                    <div className="mb-6">
                                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-gray-100">
                                                                            ASSIGNMENT
                                                                        </h4>
                                                                        <div className="space-y-1">
                                                                            {slot.assignments.map((assignment: Assignment) => (
                                                                                <div key={assignment.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group transition-colors">
                                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                                            <FileText className="w-4 h-4 text-pink-600" />
                                                                                        </div>
                                                                                        <div className="min-w-0 flex flex-col">
                                                                                            <span className="text-sm font-medium text-gray-800">
                                                                                                {assignment.displayName || `ASM${assignment.instanceNumber}`}
                                                                                            </span>
                                                                                            {assignment.description && (
                                                                                                <span className="text-xs text-gray-500 truncate">{assignment.description}</span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                                                                                        {assignment.fileUrl && (
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setPreviewFile({ url: assignment.fileUrl!, name: assignment.fileName || 'Assignment File' });
                                                                                                    setIsPreviewModalOpen(true);
                                                                                                }}
                                                                                                className="px-2 py-1 text-xs text-orange-600 hover:underline transition-colors bg-transparent font-medium"
                                                                                            >
                                                                                                Preview
                                                                                            </button>
                                                                                        )}
                                                                                        <span className="text-xs font-bold text-gray-500">N/A</span>
                                                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                            <button
                                                                                                onClick={() => navigate(`/teacher/assignment/${assignment.id}/submissions`)}
                                                                                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                                                title="Submissions"
                                                                                            >
                                                                                                <Users className="w-4 h-4" />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => handleDeleteAssignment(e, assignment)}
                                                                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                                            >
                                                                                                <Trash2 className="w-4 h-4" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {/* Empty State if all 3 are empty */}
                                                                {slot.questions.length === 0 && (() => {
                                                                    const ptNums: number[] = [];
                                                                    slot.topics.forEach(topic => {
                                                                        const m = topic.match(/\b(?:Progress Test|PT)\s*(\d+)\b/i);
                                                                        if (m) ptNums.push(parseInt(m[1]));
                                                                    });
                                                                    return exams.filter(e => ptNums.includes(e.instanceNumber)).length === 0;
                                                                })() && slot.assignments.length === 0 && (
                                                                    <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                                                                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                                                        <p className="text-sm text-gray-400 italic">No slot contents for this slot</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
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
                                <button
                                    onClick={() => {
                                        setCreateAssignmentSlotInfo(null);
                                        setIsCreateAssignmentModalOpen(true);
                                    }}
                                    className="px-4 py-2 bg-[#F37022] text-white rounded-lg hover:bg-[#d95f19] transition-colors font-medium flex items-center gap-2 shadow-sm"
                                >
                                    <Plus className="w-4 h-4" /> Create Assignment
                                </button>
                            </div>

                            {isLoadingAssignments ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Loader2 className="w-8 h-8 text-[#F37022] animate-spin mx-auto mb-4" />
                                    Loading assignments...
                                </div>
                            ) : assignmentsData?.items?.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="font-medium text-lg text-gray-500">No assignments created</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignmentsData?.items?.map(assignment => (
                                        <div key={assignment.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-bold text-[#0A1B3C]">{assignment.displayName || `Assignment ${assignment.instanceNumber}`}</h3>
                                                        {assignment.dueDate && new Date(assignment.dueDate) < new Date() ? (
                                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-red-50 border border-red-200 text-red-700">Closed</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-green-50 border border-green-200 text-green-700">Active</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                                                        </span>
                                                        {assignment.description && (
                                                            <span className="font-medium text-gray-500 max-w-sm truncate whitespace-nowrap">
                                                                {assignment.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => navigate(`/teacher/assignment/${assignment.id}/submissions`)}
                                                        className="px-4 py-2 bg-[#F37022] text-white rounded-lg hover:bg-[#d95f19] transition-colors text-sm font-medium shadow-sm"
                                                    >
                                                        View Submissions
                                                    </button>
                                                    <button
                                                        onClick={() => toast.info('Edit functionality coming soon')}
                                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#0A1B3C] transition-colors text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                                        {exam.displayName || (exam.category ? `${exam.category} ${exam.instanceNumber}` : `Progress Test ${exam.instanceNumber}`)}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-1">{exam.syllabusName}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 whitespace-nowrap ml-4 shrink-0">
                                                    Wt: {exam.weight || '0'}%
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

            <Modal
                title={previewFile?.name}
                open={isPreviewModalOpen}
                onCancel={() => {
                    setIsPreviewModalOpen(false);
                    setPreviewFile(null);
                }}
                footer={null}
                width={800}
                centered
                destroyOnClose
            >
                {previewFile && (
                    <div className="mt-4">
                        {/* Dummy preview component since filePreview isn't imported, but matches prior behavior */}
                        <div className="w-full h-[600px] bg-gray-50 border rounded-lg flex items-center justify-center text-gray-500">
                           <FileText className="w-8 h-8 mr-2" /> <a href={previewFile.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">View File: {previewFile.url}</a>
                        </div>
                    </div>
                )}
            </Modal>

            <ExamDetailModal
                exam={selectedExam}
                isOpen={isExamDetailModalOpen}
                onClose={() => {
                    setIsExamDetailModalOpen(false);
                    setSelectedExam(null);
                }}
            />

            {examToEdit && (
                <EditExamModal
                    exam={examToEdit}
                    isOpen={isEditExamModalOpen}
                    onClose={() => {
                        setIsEditExamModalOpen(false);
                        setExamToEdit(null);
                    }}
                />
            )}

            <Modal
                title={`Students Enrolled in ${course.code}`}
                open={isStudentListModalOpen}
                onCancel={() => setIsStudentListModalOpen(false)}
                footer={null}
                width={600}
                centered
            >
                <div className="mt-4">
                    {isLoadingStudents ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <Loader2 className="w-8 h-8 text-[#F37022] animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Loading student list...</p>
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {studentsData?.items && studentsData.items.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-500 mb-2">Total: {studentsData.items.length} students</div>
                                    {studentsData.items.map((student) => (
                                        <div key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-orange-50 hover:border-orange-100 transition-colors">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#F37022] font-bold shadow-sm border border-gray-100 flex-shrink-0">
                                                {student.studentName?.charAt(0) || <Users className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-[#0A1B3C] truncate">{student.studentName}</p>
                                                <p className="text-xs text-gray-500 font-medium">{formatStudentCode(student.studentCode)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                    <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-500 font-medium">No students currently enrolled.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            <CreateAssignmentModal
                isOpen={isCreateAssignmentModalOpen}
                onClose={() => {
                    setIsCreateAssignmentModalOpen(false);
                    setCreateAssignmentSlotInfo(null);
                }}
                classSubjectId={classSubject?.id || courseId || ''}
                slotTitle={createAssignmentSlotInfo?.title}
                existingCount={assignments.length}
            />
        </div>
    );
}

export default TeacherCourseDetails;
