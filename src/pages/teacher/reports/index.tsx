import { useState, useMemo, useEffect } from 'react';
import {
    AlertTriangle,
    Calendar,
    Clock,
    FileVideo,
    Image as ImageIcon,
    Eye,
    Download,
    ChevronRight,
    Users,
    FileText,
    ArrowLeft,
    Search,
    Filter,
    BarChart3,
    GraduationCap,
    BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dayjs from 'dayjs';
import { useGetAuthTeacherTeachingSubjectsQuery } from '@/api/teachersApi';
import { useGetSemestersQuery, useGetDefaultSemesterQuery } from '@/api/semestersApi';
import { useGetExamsByClassSubjectIdQuery } from '@/api/examsApi';
import { useGetAllStudentExamsQuery } from '@/api/studentExamsApi';
import { useGetStudentCheatLogsQuery } from '@/api/studentCheatLogsApi';
import { Loader2 } from 'lucide-react';

// --- Types ---
interface StudentEvidence {
    id: number;
    studentName: string;
    studentCode: string;
    suspiciousActivity: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
    duration: string;
    attachments: {
        type: 'image' | 'video';
        url: string;
        thumbnail?: string;
        timestamp: string;
    }[];
    description: string;
}

interface ExamReport {
    id: string;
    name: string;
    code: string;
    date: string;
    totalStudents: number;
    flaggedCount: number;
    students: StudentEvidence[];
}

interface ClassSubject {
    id: string;
    className: string;
    subjectCode: string;
    subjectName: string;
    semester: string;
    exams: ExamReport[];
}

// --- Views ---
type ViewState = 'CLASSES' | 'EXAMS' | 'STUDENTS' | 'DETAIL';

function TeacherReports() {
    // --- State ---
    const [view, setView] = useState<ViewState>('CLASSES');
    const [semester, setSemester] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Selection state
    const [selectedClass, setSelectedClass] = useState<any | null>(null);
    const [selectedExam, setSelectedExam] = useState<any | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    // --- API Queries ---
    const { data: defaultSemester } = useGetDefaultSemesterQuery();
    const { data: semestersData } = useGetSemestersQuery({ page: 1, pageSize: 100 });
    const semestersList = semestersData?.items || [];

    useEffect(() => {
        if (defaultSemester?.id && !semester) {
            setSemester(defaultSemester.id);
        }
    }, [defaultSemester, semester]);

    const { data: teachingData, isLoading: loadingClasses } = useGetAuthTeacherTeachingSubjectsQuery(
        { semesterId: semester },
        { skip: !semester }
    );

    const { data: examsData, isLoading: loadingExams } = useGetExamsByClassSubjectIdQuery(
        selectedClass?.classSubjectId || '',
        { skip: !selectedClass || view !== 'EXAMS' }
    );

    // To get flagged students, we get all cheat logs for this exam
    const { data: logsData, isLoading: loadingLogs } = useGetStudentCheatLogsQuery(
        { examId: selectedExam?.id },
        { skip: !selectedExam || view !== 'STUDENTS' }
    );

    // Also get all student exams to show total participants
    const { data: studentExamsData } = useGetAllStudentExamsQuery(
        { examId: selectedExam?.id },
        { skip: !selectedExam || view !== 'STUDENTS' }
    );

    // Group logs by studentExamId for the STUDENTS view
    const flaggedStudents = useMemo(() => {
        if (!logsData?.items) return [];

        const grouped = logsData.items.reduce((acc: any, log: any) => {
            const id = log.studentExamId;
            if (!acc[id]) {
                acc[id] = {
                    id,
                    studentName: log.studentName || 'Student',
                    studentCode: 'Unknown', // Need to find from studentExamsData
                    suspiciousActivity: log.status,
                    severity: 'medium', // Default to medium
                    timestamp: log.timestamp,
                    duration: 'N/A',
                    attachments: [],
                    description: `Captured proctoring log: ${log.status}`
                };

                // Try to find student info from studentExamsData
                if (studentExamsData?.items) {
                    const se = studentExamsData.items.find((x: any) => x.studentExamId === id);
                    if (se) {
                        acc[id].studentName = se.studentName || acc[id].studentName;
                        acc[id].studentCode = se.studentCode || acc[id].studentCode;
                    }
                }
            }
            const attachmentUrl = log.capturedImageUrl;
            const isVideo = typeof attachmentUrl === 'string' && attachmentUrl.toLowerCase().includes('.webm');
            acc[id].attachments.push({
                type: isVideo ? 'video' : 'image',
                url: attachmentUrl,
                thumbnail: (log as any).thumbnailUrl || undefined,
                timestamp: dayjs(log.timestamp).format('HH:mm:ss')
            });
            return acc;
        }, {});

        return Object.values(grouped) as StudentEvidence[];
    }, [logsData, studentExamsData]);

    // --- Helpers ---
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-50 text-red-600 border-red-100 ring-red-500';
            case 'medium': return 'bg-orange-50 text-orange-600 border-orange-100 ring-orange-500';
            case 'low': return 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500';
            default: return 'bg-gray-50 text-gray-600 border-gray-100 ring-gray-500';
        }
    };

    // --- Search & Filtering ---
    const filteredClasses = useMemo(() => {
        if (!teachingData?.subjects) return [];
        return teachingData.subjects.filter((cs: any) => {
            const matchesSearch = cs.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cs.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cs.subjectName?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [teachingData, searchTerm]);

    const handleBack = () => {
        if (view === 'DETAIL') {
            setView('STUDENTS');
            setSelectedStudent(null);
        } else if (view === 'STUDENTS') {
            setView('EXAMS');
            setSelectedExam(null);
        } else if (view === 'EXAMS') {
            setView('CLASSES');
            setSelectedClass(null);
        }
    };

    // --- Breadcrumb Navigation ---
    const Breadcrumbs = () => (
        <nav className="flex items-center gap-2 text-sm mb-6 text-gray-500 px-1">
            <button
                onClick={() => { setView('CLASSES'); setSelectedClass(null); setSelectedExam(null); setSelectedStudent(null); }}
                className="hover:text-[#F37022] transition-colors font-medium"
            >
                Reports
            </button>
            {selectedClass && (
                <>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <button
                        onClick={() => { setView('EXAMS'); setSelectedExam(null); setSelectedStudent(null); }}
                        className={`hover:text-[#F37022] transition-colors ${view === 'EXAMS' ? 'text-[#0A1B3C] font-semibold' : 'font-medium'}`}
                    >
                        {selectedClass.className}
                    </button>
                </>
            )}
            {selectedExam && (
                <>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <button
                        onClick={() => { setView('STUDENTS'); setSelectedStudent(null); }}
                        className={`hover:text-[#F37022] transition-colors ${view === 'STUDENTS' ? 'text-[#0A1B3C] font-semibold' : 'font-medium'}`}
                    >
                        {selectedExam.displayName || selectedExam.name}
                    </button>
                </>
            )}
            {selectedStudent && (
                <>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-[#0A1B3C] font-semibold">{selectedStudent.studentName}</span>
                </>
            )}
        </nav>
    );

    // --- Views ---

    const ClassesView = () => {
        if (loadingClasses) {
            return (
                <div className="col-span-full py-20 text-center">
                    <Loader2 className="w-12 h-12 text-[#F37022] animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">Loading your courses...</h3>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredClasses.length > 0 ? (
                    filteredClasses.map((cs: any) => {
                        return (
                            <motion.div
                                key={cs.classSubjectId}
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => { setSelectedClass(cs); setView('EXAMS'); setSearchTerm(''); }}
                                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#F37022]/30 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F37022]/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-[#F37022]/10 transition-colors" />

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="bg-blue-50 p-3 rounded-xl">
                                        <Users className="w-6 h-6 text-[#0066b3]" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-[#0A1B3C] mb-1 group-hover:text-[#F37022] transition-colors">{cs.className}</h3>
                                <p className="text-sm font-semibold text-[#0066b3] mb-3">{cs.subjectCode}</p>
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">{cs.subjectName}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>View Exams</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No classes found</h3>
                        <p className="text-gray-400">Try adjusting your search</p>
                    </div>
                )}
            </motion.div>
        );
    };


    const ExamsView = () => {
        if (loadingExams) {
            return (
                <div className="py-20 text-center">
                    <Loader2 className="w-12 h-12 text-[#F37022] animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">Fetching exams...</h3>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
            >
                <div className="bg-[#0A1B3C] text-white p-8 rounded-3xl mb-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <BookOpen className="w-8 h-8 text-[#F37022]" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-1">{selectedClass?.className}</h2>
                            <p className="text-blue-100 opacity-80">{selectedClass?.subjectName}</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-[#0A1B3C] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-4" />
                    Available Exams
                </h3>

                {examsData?.items && examsData.items.length > 0 ? (
                    examsData.items.map((exam: any) => (
                        <motion.div
                            key={exam.id}
                            whileHover={{ x: 8 }}
                            onClick={() => { setSelectedExam(exam); setView('STUDENTS'); }}
                            className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#F37022]/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-colors bg-blue-50`}>
                                    <BarChart3 className={`w-5 h-5 text-blue-500`} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0A1B3C] group-hover:text-[#F37022] transition-colors">{exam.displayName}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5 font-mono bg-gray-50 px-2 py-0.5 rounded text-xs">
                                            {exam.tag}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {dayjs(exam.startTime).format('MMM DD, YYYY')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 md:mt-0 flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Participants</p>
                                    <p className={`text-xl font-black text-[#0A1B3C]`}>
                                        {exam.participationCount}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#F37022]/10 transition-colors">
                                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#F37022]" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400">No exams found for this course.</p>
                    </div>
                )}
            </motion.div>
        );
    };

    const StudentsView = () => {
        const filteredStudents = useMemo(() => {
            return (flaggedStudents as StudentEvidence[]).filter((s: StudentEvidence) =>
                s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.suspiciousActivity.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }, [searchTerm, flaggedStudents]);

        if (loadingLogs) {
            return (
                <div className="py-20 text-center">
                    <Loader2 className="w-12 h-12 text-[#F37022] animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">Analyzing proctoring logs...</h3>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-[#0A1B3C]">{selectedExam?.displayName}</h2>
                        <p className="text-gray-500">
                            {searchTerm ? `Found ${filteredStudents.length} matches` : `Showing ${flaggedStudents.length} flagged students out of ${selectedExam?.participationCount || 0} total`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student: StudentEvidence) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all border-l-4 ${student.severity === 'high' ? 'border-l-red-500' :
                                        student.severity === 'medium' ? 'border-l-orange-500' : 'border-l-blue-500'
                                    }`}
                            >
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-[#0A1B3C]">{student.studentName}</h3>
                                                <span className="text-xs font-mono font-bold bg-[#0066b3]/10 text-[#0066b3] px-2 py-0.5 rounded">
                                                    {student.studentCode}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getSeverityStyles(student.severity)}`}>
                                                    {student.severity} Risk
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[#EF4444] font-semibold text-sm mb-4 bg-red-50 w-fit px-3 py-1 rounded-lg">
                                                <AlertTriangle className="w-4 h-4" />
                                                {student.suspiciousActivity}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{dayjs(student.timestamp).format('MMM DD, YYYY')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{dayjs(student.timestamp).format('HH:mm:ss')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <BarChart3 className="w-4 h-4" />
                                                    <span>{student.attachments.length} Evidence captures</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => { setSelectedStudent(student); setView('DETAIL'); }}
                                                className="flex-1 lg:flex-none px-6 py-2.5 bg-[#0A1B3C] text-white text-sm font-bold rounded-xl hover:bg-[#F37022] transition-colors flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Review Evidence
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                            {searchTerm ? (
                                <>
                                    <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h4 className="text-xl font-bold text-gray-400">No students found matching "{searchTerm}"</h4>
                                </>
                            ) : (
                                <>
                                    <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h4 className="text-xl font-bold text-gray-400">Excellent! No violations detected</h4>
                                    <p className="text-gray-400 mt-1">All students in this exam followed the guidelines.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };


    const DetailView = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
            {/* Left: Info & Description */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-[#0066b3]/10 text-[#0066b3] rounded-2xl flex items-center justify-center">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0A1B3C]">{selectedStudent?.studentName}</h2>
                            <p className="text-[#0066b3] font-mono text-sm font-bold">{selectedStudent?.studentCode}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider">Detection Summary</p>
                            <p className="text-sm font-semibold text-[#0A1B3C] flex items-center gap-2">
                                <AlertTriangle className={`w-4 h-4 ${selectedStudent?.severity === 'high' ? 'text-red-500' : 'text-orange-500'}`} />
                                {selectedStudent?.suspiciousActivity}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider">Detailed Findings</p>
                            <p className="text-sm leading-relaxed text-gray-600">
                                {selectedStudent?.description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <button className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Confirm Cheating
                        </button>
                        <button className="w-full py-3 bg-white text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors border border-gray-200">
                            Dismiss False Positive
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Evidence Gallery */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[#0A1B3C]">Evidence Gallery</h3>
                            <p className="text-sm text-gray-400">{selectedStudent?.attachments.length} files captured by proctoring engine</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-[#0A1B3C] transition-colors bg-gray-50 rounded-xl">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedStudent?.attachments.map((file: any, idx: number) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                className="group relative aspect-video bg-gray-900 rounded-2xl overflow-hidden cursor-pointer shadow-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />

                                {file.type === 'image' ? (
                                    <img
                                        src={file.url}
                                        alt={`Evidence ${idx}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <video
                                        controls
                                        playsInline
                                        preload="metadata"
                                        src={file.url}
                                        poster={file.thumbnail}
                                        className="w-full h-full object-contain bg-black"
                                    />
                                )}

                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-white/60" />
                                        <span className="text-xs font-mono">{file.timestamp}</span>
                                    </div>
                                    <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-[#F37022] p-2 rounded-lg shadow-lg shadow-orange-200">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-[#0A1B3C]">Integrity Reports</h1>
                        </div>
                        <p className="text-gray-500 font-medium">Monitor and review proctoring evidence across your courses</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search student or class..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F37022]/20 focus:border-[#F37022] outline-none transition-all w-full md:w-64 shadow-sm"
                            />
                        </div>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#0A1B3C] focus:ring-2 focus:ring-[#F37022]/20 outline-none transition-all shadow-sm cursor-pointer"
                        >
                            {semestersList.map((sem: any) => (
                                <option key={sem.id} value={sem.id}>{sem.semesterCode}</option>
                            ))}
                            {semestersList.length === 0 && defaultSemester && (
                                <option value={defaultSemester.id}>{defaultSemester.semesterCode}</option>
                            )}
                        </select>
                        <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                            <Filter className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Navigation & Toolbar */}
                <div className="flex items-center justify-between mb-4">
                    <Breadcrumbs />
                    {view !== 'CLASSES' && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0A1B3C] transition-colors mb-6 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to {view === 'DETAIL' ? 'Students' : view === 'STUDENTS' ? 'Exams' : 'Classes'}
                        </button>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {view === 'CLASSES' && <ClassesView key="classes" />}
                        {view === 'EXAMS' && <ExamsView key="exams" />}
                        {view === 'STUDENTS' && <StudentsView key="students" />}
                        {view === 'DETAIL' && <DetailView key="detail" />}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default TeacherReports;

